describe('multipleFulfills(validator, args)', () => {
    let registry;
    const isArray = 'isArray';
    const ary = [1, 2, 3];

    beforeEach(() => {
        registry = new ReliableJavaScript.ContractRegistry();
        registry.define(isArray, Array.isArray);
    });

    describe('생성', () => {
        it('new 로 만들어야 한다.', () => {
            expect(() => ReliableJavaScript.ContractRegistry())
                .toThrow(new Error(
                    ReliableJavaScript.ContractRegistry.messages.newRequired));
        });
    });

    describe('validator 가 함수일 경우', () => {
        const args = ['a', 'b'];
        it('args 에 대한 validator 의 호출 결과를 반환한다.', () => {

            function isLength2() {
                return arguments.length === 2;
            }

            function isLength3() {
                return arguments.length === 3;
            }

            expect(registry.multipleFulfills(isLength2, args)).toBe(true);
            expect(registry.multipleFulfills(isLength3, args)).toBe(false);
        });

        it('registry 를 컨텍스트로 validator 를 호출한다.', () => {

            function calledOnRegistry() {
                expect(this).toBe(registry);
            }

            registry.multipleFulfills(calledOnRegistry, args);
        });
    });
});