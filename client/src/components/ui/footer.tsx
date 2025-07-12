import { Link } from 'react-router-dom'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    pages: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: '404', href: '/404' }
    ],
    links: [
      { name: 'Services', href: '/services' },
      { name: 'Process', href: '/process' },
      { name: 'Case studies', href: '/case-studies' },
      { name: 'Benefits', href: '/benefits' },
      { name: 'Pricing', href: '/pricing' }
    ],
    socials: [
      { name: 'Instagram', href: 'https://instagram.com' },
      { name: 'Facebook', href: 'https://facebook.com' },
      { name: 'LinkedIn', href: 'https://linkedin.com' },
      { name: 'Twitter', href: 'https://twitter.com' }
    ]
  }

  return (
    <footer className="w-full bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Skill Swap" className="h-6 text-foreground" />
              <span className="text-xl font-bold text-foreground">SKILL SWAP</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Automate Smarter, Optimize Faster, and Grow Stronger with our real-time skill-sharing platform.
            </p>
            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-foreground font-medium">Join our newsletter</h3>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="flex-1 px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-foreground font-medium mb-6">Links</h3>
            <ul className="space-y-4">
              {links.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="text-foreground font-medium mb-6">Pages</h3>
            <ul className="space-y-4">
              {links.pages.map((page) => (
                <li key={page.name}>
                  <Link
                    to={page.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Section */}
          <div>
            <h3 className="text-foreground font-medium mb-6">Socials</h3>
            <ul className="space-y-4">
              {links.socials.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="text-center space-y-4">
            <h3 className="text-foreground font-medium">Built with modern tech</h3>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground text-sm">
              <span>React</span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span>TailwindCSS</span>
              <span>•</span>
              <span>ShadCN UI</span>
              <span>•</span>
              <span>React Query</span>
              <span>•</span>
              <span>Socket.IO</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Skill Swap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 