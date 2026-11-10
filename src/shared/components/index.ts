// Componentes compartidos (LT4-23). Importar desde acá:
// import { Button, DataTable, FormField, IconPlus } from '../../shared/components';
export { Button, type ButtonProps } from './Button/Button';
export { FormField, type FormFieldProps } from './FormField/FormField';
export { fieldErrorId } from './FormField/fieldErrorId';
export { DataTable, type Column, type DataTableProps } from './DataTable/DataTable';
export { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog/ConfirmDialog';
export { StatusBadge, type StatusBadgeProps } from './StatusBadge/StatusBadge';
export { Spinner } from './Spinner/Spinner';
export { EmptyState, type EmptyStateProps } from './EmptyState/EmptyState';
export { Card, type CardProps } from './Card/Card';
export { FilterChips, type FilterChipsProps, type FilterOption } from './FilterChips/FilterChips';
export { SearchInput, type SearchInputProps } from './SearchInput/SearchInput';
export * from './icons/icons';
