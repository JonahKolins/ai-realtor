export namespace memoUtils {
    // Абстрактная функция
    type AbstractFunction = (...arg: unknown[]) => unknown;
// Тип функции-фабрики возвращающей функцию по одному аргументу;
    type FunctionFactory = (arg: unknown) => AbstractFunction;

// Функция для кэширования функций создаваемой функции-фабрики через один аргумент
    export const createMemorizeFactory = <T extends FunctionFactory>(factory: T): T => {
        const memoBuffer: Map<unknown, AbstractFunction> = new Map();

        const handler = (arg: unknown) => {
            const memorizeFn = memoBuffer.get(arg);
            if (memorizeFn) return memorizeFn;
            const fn = factory(arg);
            memoBuffer.set(arg, fn);
            return fn;
        };

        return handler as T;
    };


    export type EqualityFn = (newArgs: any[], lastArgs: any[]) => boolean;

    const isEqual = (first: unknown, second: unknown): boolean => {
		if (first === second) return true
        if (Number.isNaN(first) && Number.isNaN(second)) return true;
        return false;
    }

    const areInputsEqual = (newInputs: unknown[], lastInputs: unknown[]): boolean => {
        if (newInputs.length !== lastInputs.length) return false;
        for (let i = 0; i < newInputs.length; i++) {
            if (!isEqual(newInputs[i], lastInputs[i])) return false;
        }

        return true;
    }

    export function memoizeOne<
        ResultFn extends (this: any, ...newArgs: any[]) => ReturnType<ResultFn>
        >(resultFn: ResultFn, isEqual: EqualityFn = areInputsEqual): ResultFn {
        let lastThis: unknown;
        let lastArgs: unknown[] = [];
        let lastResult: ReturnType<ResultFn>;
        let calledOnce: boolean = false;

        // breaking cache when context (this) or arguments change
        function memoized(this: unknown, ...newArgs: unknown[]): ReturnType<ResultFn> {
            if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
                return lastResult;
            }

            // Throwing during an assignment aborts the assignment: https://codepen.io/alexreardon/pen/RYKoaz
            // Doing the lastResult assignment first so that if it throws
            // nothing will be overwritten
            lastResult = resultFn.apply(this, newArgs);
            calledOnce = true;
            lastThis = this;
            lastArgs = newArgs;
            return lastResult;
        }

        return memoized as ResultFn;
    }
}
