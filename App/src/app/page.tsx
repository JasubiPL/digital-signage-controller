export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
            Migracion Next.js + Supabase
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Digital Signage Controller
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            Base nueva del panel de senalizacion digital. Esta app reemplazara
            gradualmente la interfaz Vite y el servidor Express con una
            arquitectura Next.js conectada a Supabase.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["App Router", "Rutas y layouts server-first para el panel."],
            ["Supabase", "Auth, Postgres, Storage y RLS como backend cloud."],
            ["npm", "Un solo gestor de paquetes para la migracion."],
          ].map(([title, description]) => (
            <article
              className="rounded border border-zinc-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-base font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
      </main>
  );
}
