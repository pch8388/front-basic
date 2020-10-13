var ReliableJavaScript = ReliableJavaScript || {};
ReliableJavaScript.ContractRegistry = function() {
    'use strict';

    const registry = {};

    if (!(this instanceof ReliableJavaScript.ContractRegistry)) {
        throw new Error(ReliableJavaScript.ContractRegistry.messages.newRequired);
    }

    this.define = (contractName, evaluator) => {
        if (typeof contractName !== 'string') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.nameMustBeString);
        }

        contractName = contractName.trim();

        if (contractName.length === 0) {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.nameMustBeString);
        }

        if (typeof evaluator !== 'function') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.evaluatorMustBeFunction);
        }

        registry[contractName] = evaluator;
        return this;
    };

    this.fulfills = (contractName, obj) => {
        if (typeof contractName === 'string') {
            contractName = contractName.trim();
        }

        if (!registry[contractName]) {
            throw new Error(this.getMessageForNameNotRegistered(contractName));
        }

        return registry[contractName](obj);
    };
};

ReliableJavaScript.ContractRegistry.prototype.defineMultiple = function(contracts) {
    if (!Array.isArray(contracts)) {
        throw new Error(
            ReliableJavaScript.ContractRegistry.messages.contractsArrayInvalid);
    }

    for (const contract of contracts) {
        if (!contract.name || !contract.evaluator) {
            throw new Error(
                ReliableJavaScript.ContractRegistry.messages.contractsArrayInvalid);
        }
    }

    contracts.forEach(c => this.define(c.name, c.evaluator));
    return this;
};

ReliableJavaScript.ContractRegistry.prototype.assert = function(contractName, obj) {
    if (!this.fulfills(contractName, obj)) {
        throw new Error(this.getMessageForFailedContract(contractName, obj));
    }

    return this;
};

ReliableJavaScript.ContractRegistry.prototype.multipleFulfills = function(validator, args) {
    const self = this;
    console.log(this)

    function validateWithContractNameString(v) {
        const contractNames = v.split(',');
        for (let ix = 0; ix < contractNames.length; ix++) {
            if (contractNames[ix].length === 0) {
                continue;
            }
            if (!self.fulfills(contractNames[ix], args[ix])) {
                return false;
            }
        }
        return true;
    }

    if (Array.isArray(validator)) {
        validator.forEach(elem => {
            if (typeof elem !== 'string') {
                throw new Error(ReliableJavaScript.ContractRegistry.messages.validatorsInvalid);
            }
        });
    } else if (typeof validator !== 'function' && typeof validator !== 'string') {
        throw new Error(ReliableJavaScript.ContractRegistry.messages.validatorsInvalid);
    }

    if (!Array.isArray(args) && (!args || typeof args !== 'object' || args.length === undefined)) {
        throw new Error(ReliableJavaScript.ContractRegistry.messages.argsMustBeArrayLike);
    }

    if (typeof validator === 'string') {
        return self.fulfills(validator, args);
    }

    if (Array.isArray(validator)) {
        for (let index = 0; index < validator.length; index++) {
            if (validateWithContractNameString(validator[index])) {
                return true;
            }
        }

        return validator.length === 0;
    }

    if (typeof validator === 'function') {
        return validator.apply(self, args);
    }
};

ReliableJavaScript.ContractRegistry.prototype.multipleAssert = function(validator, args) {
    if (!this.multipleFulfills(validator, args)) {
        throw new Error(ReliableJavaScript.ContractRegistry.messages.argsFailedContract);
    }

    return this;
};

//인자 검사기를 'funcObj' 객체의 'funcName' 함수에 붙인다
//검사기는 multipleAssert에서 꺼내어 사용한다
ReliableJavaScript.ContractRegistry.prototype.attachArgumentsValidator = function(funcName, funcObj, validator) {
        const self = this;
        function validateStringOrUndefined(contractName) {
            if (contractName!==undefined && typeof contractName !== 'string') {
                throw new Error(ReliableJavaScript.ContractRegistry.messages.namesMustBeStringArray);
            }
        }
        if (typeof funcName !== 'string') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.funcNameMustBeString);
        }
        if (typeof funcObj !== 'object') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.funcObjMustBeObject);
        }
        if (Array.isArray(validator)) {
            validator.forEach(function assertStringNullOrUndefined(v) {
                if (typeof v !== 'string' &&
                    typeof v !== 'undefined') {
                    throw new Error(ReliableJavaScript.ContractRegistry.messages.validatorsInvalid);
                }
            });
        } else if (typeof validator !== 'function' &&
            typeof validator !== 'string') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.validatorsInvalid);
        }

        Aop.before(funcName, function validateArguments() {
            self.multipleAssert(validator,arguments);
        }, funcObj );

        return this;
    };

ReliableJavaScript.ContractRegistry.prototype.attachReturnValidator = function(funcName, funcObj, contractName) {
        const self = this;
        if (typeof funcName !== 'string') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.funcNameMustBeString);
        }
        if (typeof funcObj !== 'object') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.funcObjMustBeObject);
        }
        if (typeof contractName !== 'string') {
            throw new Error(ReliableJavaScript.ContractRegistry.messages.nameMustBeString);
        }

        Aop.around(funcName,
            function validateReturn(targetInfo) {
                const ret = Aop.next(targetInfo);
                self.assert(contractName,ret);
                return ret;
            }, funcObj);

        return this;
    };

ReliableJavaScript.ContractRegistry.messages = {
    newRequired: '규약 레지스트리는 "new"로 인스턴스화해야 합니다',
    nameMustBeString: '규약명은 적어도 한 개의 문자로 이루어진 문자열이어야 합니다',
    evaluatorMustBeFunction: '평가기는 함수만 가능합니다',
    nameMustBeRegistered: "'_'은 레지스트리에 없는 규약입니다",
    funcNameMustBeString: '함수명은 반드시 공백 아닌 문자열이어야 합니다',
    funcObjMustBeObject: '장식할 객체는 반드시 객체여야 합니다',
    validatorsInvalid:
        '검사기 인자는 반드시 문자열, 문자열 배열, 각 규약명이 콤마로 구분된 목록, 함수 중 하나여야 합니다.',
    argsMustBeArrayLike: 'args 인자는 유사 배열 타입이어야 합니다',
    argsFailedContract: '규약을 위반한 인자입니다',
    failedContract: "다음 객체는 '_' 규약 위반입니다: ",
    contractsArrayInvalid: "규약 파라미터는 name 및 evaluator 두 프로퍼티를 가진 객체의 배열만 가능합니다"
};

ReliableJavaScript.ContractRegistry.prototype.getMessageForNameNotRegistered = (contractName) => {
    return ReliableJavaScript.ContractRegistry.messages
        .nameMustBeRegistered.replace('_', contractName);
};

ReliableJavaScript.ContractRegistry.prototype.getMessageForFailedContract = (contractName, obj) => {
    return ReliableJavaScript.ContractRegistry.messages
        .failedContract.replace('_', contractName) + obj;
};