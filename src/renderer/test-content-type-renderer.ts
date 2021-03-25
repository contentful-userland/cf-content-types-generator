import {ContentTypeRenderer} from '../content-type-renderer';
import {FieldRenderers} from './render-types';
export class TestContentTypeRender extends ContentTypeRenderer {
    static fieldRenderers: Partial<FieldRenderers> = {
        RichText: () => 'Contentful.RichText',
        Symbol: () => 'Contentful.Symbol',
        Array: () => 'Contentful.Array',
        Boolean: () => 'Contentful.Boolean',
        Date: () => 'COntentful.Date',
        Link: () => 'Contentful.Link',
        Integer: () => 'Contentful.Integer',
        Location: () => 'Contentful.Location',
        Number: () => 'Contentful.Nuømber',
        Object: () => 'Contentful.Object',
        Text: () => 'Contentful.Text',
    }
}
