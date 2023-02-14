import { IStyleOption } from './style-option/style-option.types';

export enum ContainerType {
    FLEX = 'flex',
    GRID = 'grid',
}

export enum BreakpointType {
    ALL = '',
    SMALL = 'sm',
    MEDIUM = 'md',
    LARGE = 'lg',
    EXTRA_LARGE = 'xl',
}

export enum GridContainerPrefix {
    COLUMNS = 'grid-cols',
    ROWS = 'grid-rows',
}

export enum GridChildPrefix {
    COLUMN_START = 'col-start',
    COLUMN_SPAN = 'col-span',
    ROW_START = 'row-start',
    ROW_SPAN = 'row-span',
}

export enum FlexContainerPrefix {
    FLEX_DIRECTION = 'flex',
}

export enum FlexContainerType {
    COMLUMN = 'flex-column',
    COMLUMN_REVERSE = 'flex-column-reverse',
    ROW = 'flex-row',
    ROW_REVERSE = 'flex-row-reverse',
}

export interface IStylingConfig {
    className: IStyleOption[];
    fieldGroupClassName: IStyleOption[];
}
