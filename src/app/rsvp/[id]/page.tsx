import RsvpClient from "./RsvpClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function RsvpPage() {
  return <RsvpClient />;
}
