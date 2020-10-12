describe('contractRegistry', () => {
    'use strict';
    let registry;
    let isArray = 'isArray';
    const ary = [1, 2, 3];

    beforeEach(() => {
        registry = ReliableJavaScript.contractRegistry();
        registry.define(isArray, Array.isArray);
    });

    describe('define(contractName, evaluator)', () => {
        it('contractName 이 문자열이 아니면 예외를 던진다', () => {
            expect(() => {
                registry.define(undefined, () => {
                });
            }).toThrow(new Error(registry.messages.nameMustBeString));
        });

        it('evaluator 가 함수가 아니면 예외를 던진다', () => {
            expect(() => {
                registry.define('myContract', '함수 아님')
            }).toThrow(new Error(registry.messages.evaluatorMustBeFunction));
        });

        it('contractName 이 문자열이고 evaluator 가 함수면 예외를 던지지 않는다.', () => {
            expect(() => {
                registry.define('myContract', () => {
                });
            }).not.toThrow();
        });
    });

    describe('fulfills(contractName, obj)', () => {
        it('contractName 이 레지스트리에 없으면 예외를 던진다.', () => {
            function expectThrow(contractName) {
                expect(() => {
                    registry.fulfills(contractName, {});
                }).toThrow(new Error(
                    registry.getMessageForNameNotRegistered(contractName)));
            }

            [undefined, 'abc'].forEach(expectThrow);
        });

        it('객체가 규약을 지키면 true 반환', () => {
            expect(registry.fulfills(isArray, ary)).toBe(true);
        });

        it('객체가 규약을 위반하면 false 반환', () => {
            expect(registry.fulfills(isArray, 'not an array')).toBe(false);
        });
    });

    describe('assert(contractName, obj)', () => {
        it('fulfills(contractName, obj)에 기반을 둔다', () => {
            spyOn(registry, 'fulfills').and.callThrough();
            registry.assert(isArray, ary);
            expect(registry.fulfills).toHaveBeenCalledWith(isArray, ary);
        });

        it('객체가 규약을 지키면 예외를 던지지 않는다', () => {
            registry.assert(isArray, ary);
        });

        it('객체가 규약을 위반하면 예외를 던진다', () => {
            const notAnArray = 'abc';
            expect(() => registry.assert(isArray,notAnArray))
                .toThrow(new Error(
                    registry.getMessageForFailedContract(isArray, notAnArray)));
        });
    });

    describe('attachReturnValidator(funcName, funcObj, contractName)', () => {
        const funcName = 'func';
        let funcObj;
        const returnValue = [1, 2, 3];

        beforeEach(() => {
            funcObj = {};
            funcObj[funcName] = () => returnValue;
        });

        describe('애스팩트 기능', () => {
            it('반환값이 규약을 지키면 이를 반환한다.', () => {
                registry.attachReturnValidator(funcName, funcObj, isArray);
                expect(funcObj[funcName]()).toEqual(returnValue);
            });

            it('반환값이 규약을 위반하면 예외를 던진다.', () => {
                const isNumber = 'isNumber';
                registry.define(isNumber, ret => typeof ret === 'number');
                registry.attachReturnValidator(funcName, funcObj, isNumber);

                expect(() => funcObj[funcName]())
                    .toThrow(new Error(
                        registry.getMessageForFailedContract(isNumber, returnValue)));
            });
        });
    });
});