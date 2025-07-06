
export class ResponseDeleteDto{

    result: 'OK' | 'PARTIAL_OK' | 'FAIL'

    items_delete: number

    items_failed?: number[] | number
    
    items_failed_ids?: number[] | number
}