import Link from 'next/link';

interface NavProps {
  type: string;
  href: string;
}

export default function Nav({ type, href }: NavProps) {
  return (
    <Link href={href} className="text-white mr-10 font-bold">
      {type}
    </Link>
  );
}

interface SubNavProps {
  type: string;
  href: string;
  active?: boolean;
}

export function SubNav({ type, href, active }: SubNavProps) {
  const styleBold = active ? 'font-bold text-gray-700' : 'text-gray-400';
  return (
    <Link
      href={href}
      className={`text-lg py-2 underline-offset-4 ${styleBold}`}
    >
      {type}
    </Link>
  );
}
