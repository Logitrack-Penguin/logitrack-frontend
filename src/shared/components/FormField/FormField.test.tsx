import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';
import { fieldErrorId } from './fieldErrorId';

describe('FormField', () => {
  it('asocia la etiqueta con el input', () => {
    render(
      <FormField label="DNI" htmlFor="dni">
        <input id="dni" />
      </FormField>,
    );
    expect(screen.getByLabelText('DNI')).toBeInTheDocument();
  });

  it('muestra la ayuda cuando no hay error', () => {
    render(
      <FormField label="DNI" htmlFor="dni" hint="8 dígitos">
        <input id="dni" />
      </FormField>,
    );
    expect(screen.getByText('8 dígitos')).toBeInTheDocument();
  });

  it('muestra el error en lugar de la ayuda y lo enlaza con el input', () => {
    render(
      <FormField label="DNI" htmlFor="dni" error="Debe tener 8 dígitos" hint="Solo números">
        <input id="dni" aria-invalid aria-describedby={fieldErrorId('dni')} />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Debe tener 8 dígitos');
    expect(screen.queryByText('Solo números')).not.toBeInTheDocument();
    expect(screen.getByLabelText('DNI')).toHaveAccessibleDescription('Debe tener 8 dígitos');
  });
});
