import Image from "next/image";

export default function Avatar({ avatar, name, small = false }) {
  const initial = (name || "?").slice(0, 1).toUpperCase();
  const className = `avatar${small ? " small" : ""}${avatar ? " has-image" : ""}`;
  if (avatar?.startsWith("data:image/")) {
    return <span className={className}><Image src={avatar} alt="" width={small ? 28 : 40} height={small ? 28 : 40} unoptimized /></span>;
  }
  return <span className={className} aria-hidden="true">{avatar || initial}</span>;
}
