import { ExternalLink } from 'lucide-react'

const footerLinks = [
  { label: 'GitLab', href: 'https://gitlab.grauea.com.br/', external: true },
  { label: 'Documentação', href: '#', external: false },
  { label: 'Contato', href: '#', external: false },
]

export function Footer() {
  return (
    <footer className="footer-bg py-14 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-white mb-1 tracking-wide">
              GRA<span className="text-primary-400">EST</span>
            </p>
            <p className="text-sm text-gray-400">
              Núcleo de Robótica e Automação — Escola Superior de Tecnologia
            </p>
          </div>

          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                {link.label}
                {link.external && <ExternalLink className="w-3 h-3" />}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />

        {/* Bottom */}
        <p className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} GRAEST. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
