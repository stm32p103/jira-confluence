import { Request } from './request';

export interface RestAPI {
    request( req: Request ): Promise<any>;
}
