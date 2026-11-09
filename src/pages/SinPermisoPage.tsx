import { Link } from 'react-router';

export function SinPermisoPage() {
  return (
    <section>
      <h1>Sin permiso</h1>
      <p>No tenés permisos para acceder a esta sección.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}
