import { BreakpointAffix, IBreakpoint, IStyleOption } from './styles.types';

export const formatVariant = (variant: string, option: IStyleOption, bp: IBreakpoint, bpAffix: BreakpointAffix) => {
    const optionValue = `${option.value ? `${option.value}-` : ''}`;
    switch (bpAffix) {
        case BreakpointAffix.PREFIX:
            return `${bp.value}${optionValue}${variant}`;
        case BreakpointAffix.INFIX:
            return `${optionValue}${bp.value ? `${bp.value}-` : ''}${variant}`;
        case BreakpointAffix.SUFFIX:
            return `${optionValue}${variant}${bp.value}`;
    }
};

export const findVariant = (source: string, option: IStyleOption, bp: IBreakpoint, bpAffix: BreakpointAffix) => {
    const variantsStr = `(${option.variants.join('|')})`;
    const optionValue = `${option.value ? `${option.value}-` : ''}`;
    let regexStr: string;
    switch (bpAffix) {
        case BreakpointAffix.PREFIX:
            regexStr = `(?<=${bp.value || '(\\s|^)'}${optionValue})${variantsStr}(?=(\\s|$))`;
            break;
        case BreakpointAffix.INFIX:
            regexStr = `(?<=(\\s|^)${optionValue}${bp.value ? `${bp.value}-` : ''})${variantsStr}(?=(\\s|$))`;
            break;
        case BreakpointAffix.SUFFIX:
            regexStr = `(?<=(\\s|^)${optionValue})${variantsStr}(?=${bp.value || '(\\s|$)'})`;
            break;
    }

    const matches: string[] | null = source.match(new RegExp(regexStr));
    return matches?.[0];
};
