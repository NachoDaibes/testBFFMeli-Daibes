import {
  BadRequestException,
  ConflictException,
  ExecutionContext,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/entities/role.entity';
import { UserRole } from 'src/entities/userRole.entity';
import { LoginUserDto } from './dto/login.dto';
import { Session } from 'src/entities/session.entity';
import { RolesEnum } from 'src/enum/roles.enum';
import { ResponseRegisterDto } from './dto/responseRegister.dto';
import { NotFoundError } from 'rxjs';
import { LogoutDto } from './dto/logout.dto';
import { ValidateXAuthTokenDto } from './dto/validateXAuthToken.dto';
import { config } from 'dotenv';
config();

@Injectable()
export class AuthService {

  private readonly logger: Logger = new Logger(AuthService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private dataSource: DataSource
  ) { }

  //Metodo para manejar el registro de los usuarios
  async register(registerDto: RegisterDto): Promise<ResponseRegisterDto> {
    //busco si existe el usuario
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    //si existe lanzo la excepcion
    if (existingUser) {
      this.logger.error(new ConflictException('[AuthService][Register] El email ingresado ya está registrado con otro usuario del sistema.'))
      throw new ConflictException('El email ingresado ya está registrado con otro usuario del sistema.');
    }

    //Encripto la contraseña y si está ok creo y guardo el usuario
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Cuando se registra el primer usuario se crean todos los roles (Sé que no está bueno manejarlo así pero era para evitar crear un abm de roles cuando no es el fin de la prueba)
      const arrayRoles = [RolesEnum.UsuarioRegular, RolesEnum.Administrador]

      // Hago una sola consulta para traer todos los roles ya existentes
      const existingRoles = await this.roleRepository.find();

      // Armo un Set con los nombres existentes para búsqueda rápida y cone l map tomo solo la propiedad name de los roles
      const existingRoleNames = new Set(existingRoles.map(role => role.name));

      for (const roleName of arrayRoles) {
        if (!existingRoleNames.has(roleName)) {
          const newRole = this.roleRepository.create({ name: roleName });
          await this.roleRepository.save(newRole);
        }
      }

      // Crear usuario
      const newUser = this.userRepository.create({
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      });
      await queryRunner.manager.save(newUser);

      this.logger.log('[AuthService][Register] Usuario guardado correctamente')

      const userRoles = registerDto.roles.map((roleName) => {
        const role = existingRoles.find((r) => r.name === roleName);
        return this.userRoleRepository.create({
          user: newUser,
          role,
        });
      });

      await queryRunner.manager.save(userRoles);
      await queryRunner.commitTransaction();

      this.logger.log('[AuthService][Register] Roles asignados al usuario correctamente')

      const response: ResponseRegisterDto = {
        nombre: newUser.name,
        email: newUser.email,
        roles: userRoles.map(userRole => userRole.role.name)
      }

      this.logger.log('[AuthService][Register] Usuario creado ' + JSON.stringify(response))

      return response
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        this.logger.error(error)
        throw error;
      }

      this.logger.error('[AuthService][Register] Ocurrió un error al registrar el usuario.')
      throw new InternalServerErrorException('Ocurrió un error al registrar el usuario.')
    }
    finally {
      await queryRunner.release()
    }
  }

  async login(loginUserDto: LoginUserDto) {
    //Busco si existe el usuario y traigo tambien las entidades relacionadas (userRoles y userRoles.role)
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      relations: ['userRoles', 'userRoles.role'],
    });

    //Valido que exista el usuario y las contraseñas sean iguales
    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {

      //Busco si el usuario tiene una session activa
      const existingSession = await this.sessionRepository.findOne({
        where: {
          user: { id: user.id }
        }
      })

      //Si existe una sesion utilizo el token guardado en ese registro
      if (existingSession) {
        this.logger.log(`[AuthService][Login] Token de sesión existente: ${existingSession.token}`)
        return { accessToken: existingSession.token }
      }

      //Acá comienzo a crear el JWT con el id del usuario y sus roles
      let roles: string[] = [];
      user.userRoles.forEach((userRole) => {
        roles.push(userRole.role.name);
      });

      const payload = { userId: user.id, userRoles: roles };
      const token = await { accessToken: this.jwtService.sign(payload) };

      //Creo una instancia en la entidad Session y le guardo el token generado
      const session = this.sessionRepository.create({
        user: user,
        token: token.accessToken,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //24 horas
      });
      await this.sessionRepository.save(session);

      this.logger.log('[AuthService][Login] Session asignada al usuario correctamente')
      this.logger.log('[AuthService][Login] AccessToken: ' + token.accessToken)

      return { accessToken: token.accessToken };
    } else {
      this.logger.error('[AuthService][Login] Credenciales incorrectas')
      throw new NotFoundException('Credenciales incorrectas');
    }
  }

  async logout(userEmail: string) {
    //Busco el usuario por ID
    const user = await this.userRepository.findOne({ where: { email: userEmail } });

    //Si existe busco su ultima session y la borro
    if (user) {
      const lastSession = await this.sessionRepository.findOne({
        where: {
          user: user,
        },
        order: { expiredAt: 'DESC' },
      });
      if (lastSession !== null) {
        this.sessionRepository.delete(lastSession);

        const response: LogoutDto = {
          status: 'OK',
          statusCode: HttpStatus.OK,
          message: 'Sesión eliminada correctamente'
        }

        this.logger.log('[AuthService][Logout] Sesion del usuario eliminada correctamente.')

        return response
      } else {
        this.logger.error('[AuthService][Logout] No existe una session del usuario ingresado')
        throw new NotFoundException('No existe una session del usuario ingresado');
      }
    } else {
      this.logger.error('[AuthService][Logout] Credenciales incorrectas')

      throw new NotFoundException('Credenciales incorrectas');
    }
  }

  async validateAccess(token: string) {
    try {

      if (!token) {
        this.logger.error('[AuthService][ValidateAccess] Token no existente.')
        throw new NotFoundException('Token no existente.');
      }

      const tokenFinal = token.slice(7);
      const session = await this.sessionRepository.findOne({
        where: {
          token: tokenFinal,
        },
      });

      if (!session) {
        this.logger.error('[AuthService][ValidateAccess] Sesión no existente o vencida.')
        throw new BadRequestException('Sesión no existente o vencida.');
      } else {
        const decodedToken: any = this.jwtService.decode(tokenFinal);
        const currentDate = Math.floor(Date.now() / 1000)

        if (decodedToken.exp < currentDate) {
          throw new HttpException(
            'Sesión vencida',
            HttpStatus.BAD_REQUEST,
          );
        }

        const roles = decodedToken.userRoles;
        return roles;
      }
    } catch (error: any) {
      this.logger.error(`[AuthService][ValidateAccess] Error al validar el acceso: ${error.message}`)
      throw new BadRequestException(error.message);
    }
  }

  //Metodo para validar el x-auth-token
  public validateXAuthToken(token: string): ValidateXAuthTokenDto{

    const validToken = process.env.VALID_TOKEN
    const mockToken = process.env.MOCK_TOKEN
    const response: ValidateXAuthTokenDto = new ValidateXAuthTokenDto()

    if(token == validToken){
      response.isValid = true
      response.isMock = false
    }else if(token == mockToken){
      response.isValid = true
      response.isMock = true
    }

    return response
  }
}