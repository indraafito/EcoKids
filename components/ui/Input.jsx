export default function Input({ error, label, id, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-base font-nunito font-extrabold text-primary-dark mb-2 ml-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-3xl p-4 focus:ring-4 focus:ring-primary-bg/40 transition-all w-full outline-none font-sans font-semibold text-lg bg-white/70 backdrop-blur-md border border-white/50 shadow-sm
          ${error ? 'border-red-300 focus:border-red-400' : 'border-white/50 focus:border-primary'}`}
        {...props}
      />
      {error && <p className="text-red-500 font-nunito font-semibold text-sm mt-1.5 ml-3">{error}</p>}
    </div>
  );
}
