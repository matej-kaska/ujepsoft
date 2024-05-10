import { useEffect, useRef } from "react";

const usePrevious = (value: any, initialValue: any) => {
	const ref = useRef(initialValue);
	useEffect(() => {
		ref.current = value;
	});
	return ref.current;
};

export const useEffectDebugger = (effectHook: any, dependencies: any, dependencyNames = []) => {
	const previousDeps = usePrevious(dependencies, []);

	const changedDeps = dependencies.reduce((accum: any, dependency: any, index: any) => {
		if (dependency !== previousDeps[index]) {
			const keyName = dependencyNames[index] || index;
			return {
				...accum,
				[keyName]: {
					before: previousDeps[index],
					after: dependency,
				},
			};
		}

		return accum;
	}, {});

	if (Object.keys(changedDeps).length) {
		console.info("[use-effect-debugger] ", changedDeps);
	}

	useEffect(effectHook, dependencies);
};
