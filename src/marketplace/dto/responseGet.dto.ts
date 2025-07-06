
export class ResponseGetDto{
    paging: PagingDto
    category: CategoryDto
    items: ItemDto[]
}

export class PagingDto {
    total: number
    offset: number
    limit: number
}

export class CategoryDto {
    name: string
}

export class ItemDto{
    id: number
    title: string
    price: number
    picture: string
    price_discount: number
    rating: number
    free_shipping: boolean
}