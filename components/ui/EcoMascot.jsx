import Image from 'next/image';

export default function EcoMascot({ size = 80, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/icon.svg"
        alt="EcoKids Mascot"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
