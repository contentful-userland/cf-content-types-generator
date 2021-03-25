import { expect } from "@oclif/test";
import { linkContentTypeValidations, moduleName } from "../src/utils";

describe('A moduleName function', () => {

    const specs = [
        { input: 'helloWorld', expect: 'TypeHelloWorld' },
        { input: 'hello-World', expect: 'TypeHello__World' },
        { input: '0helloWorld', expect: 'Type0helloWorld' },
        { input: '0-helloWorld', expect: 'Type0__helloWorld' },
        { input: '1-0-helloWorld', expect: 'Type1__0__helloWorld' },
        { input: 'hello World', expect: 'TypeHelloWorld' },
        { input: 'hello-World', expect: 'TypeHello__World' },
        { input: '12345', expect: 'Type12345' },
    ];

    specs.forEach(spec => {
        it('transforms \'' + spec.input + '\' to valid module name \'' + spec.expect + '\'', () => {
            expect(moduleName(spec.input)).to.equal(spec.expect);
        });
    })
});

describe('A linkContentTypeValidations function', () => {
    it('parses empty validations', () => {
        const field = { validations: [] }
        expect(linkContentTypeValidations(field)).to.eql([])
    })

    it('parses empty linked content type', () => {
        const field = { validations: [{ linkContentType: [] }] }
        expect(linkContentTypeValidations(field)).to.eql([])
    })

    it('parses single linked content type', () => {
        const field = { validations: [{ linkContentType: ["topicCategory"] }] }
        expect(linkContentTypeValidations(field)).to.eql(['topicCategory'])
    })

    it('parses multiple linked content types', () => {
        const field = { validations: [{ linkContentType: ['topicA', 'topicB'] }] }
        expect(linkContentTypeValidations(field)).to.eql(['topicA', 'topicB'])
    })
})
