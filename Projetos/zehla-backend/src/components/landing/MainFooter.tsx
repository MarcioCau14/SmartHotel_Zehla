export function MainFooter() : void {
  try {
  return (
    <footer className="w-full py-6 text-center text-sm text-gray-500 border-t">
      <p>&copy; {new Date().getFullYear()} ZEHLA PRO. Todos os direitos reservados.</p>
    </footer>
  );
}
