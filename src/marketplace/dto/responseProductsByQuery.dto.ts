

export class ResponseProductsByQueryDto{

    paging: PagingDto
    categories: string[]
    items: ProductDto[]
}

export class PagingDto{
    total: number
    offset: number
    limit: number
}

export class ProductDto{
    id: string
    title: string
    price: number
    picture: string
    price_with_discount: number
    rating: number
    free_shipping: boolean
}