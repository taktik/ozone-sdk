
import * as models from './models';

export interface Package extends models.Item {
    localizedName?: { [key: string]: string; };

}
