"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Blocks,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
  KeyRound,
  LayoutDashboard,
  Package2,
  PlugZap,
  Settings2,
  ShoppingBasket,
  Store,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavProjects } from "@/components/admin/nav-projects"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Administrador",
    email: "admin@shanghaipf.com",
    avatar: "",
  },
  teams: [
    {
      name: "Shanghaipf",
      logo: GalleryVerticalEnd,
      plan: "Empresa",
    },
    {
      logo: Command,
      name: "Operación central",
      plan: "Multi-sucursal",
    },
  ],
  navMain: [
    {
      title: "Resumen operativo",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Indicadores del día",
          url: "#",
        },
        {
          title: "Actividad reciente",
          url: "#",
        },
        {
          title: "Alertas",
          url: "#",
        },
      ],
    },
    {
      title: "Pedidos",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Pedidos activos",
          url: "#",
        },
        {
          title: "Historial",
          url: "#",
        },
        {
          title: "Estados y seguimiento",
          url: "#",
        },
      ],
    },
    {
      title: "Productos",
      url: "#",
      icon: Package2,
      items: [
        {
          title: "Catálogo online",
          url: "#",
        },
        {
          title: "Imágenes y contenido",
          url: "#",
        },
        {
          title: "Disponibilidad",
          url: "#",
        },
        {
          title: "Precios y stock",
          url: "#",
        },
      ],
    },
    {
      title: "Sucursales y horarios",
      url: "#",
      icon: Store,
      items: [
        {
          title: "Horarios de atención",
          url: "#",
        },
        {
          title: "Cierres manuales",
          url: "#",
        },
        {
          title: "Configuración por sucursal",
          url: "#",
        },
        {
          title: "Storefront público",
          url: "#",
        },
      ],
    },
    {
      title: "Clientes",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Perfiles",
          url: "#",
        },
        {
          title: "Direcciones",
          url: "#",
        },
        {
          title: "Historial de compras",
          url: "#",
        },
      ],
    },
    {
      title: "Integraciones",
      url: "#",
      icon: PlugZap,
      items: [
        {
          title: "Sincronización POS",
          url: "#",
        },
        {
          title: "Logs y errores",
          url: "#",
        },
        {
          title: "Webhooks y callbacks",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard principal",
      url: "#",
      icon: Blocks,
    },
    {
      name: "Bolsa y checkout",
      url: "#",
      icon: ShoppingBasket,
    },
    {
      name: "Configuración general",
      url: "#",
      icon: Settings2,
    },
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  branchSlug?: string
}

export function AppSidebar({ branchSlug, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const usersUrl = "/admin/users"

  const navMain = React.useMemo(() => {
    if (!branchSlug) {
      return [
        {
          title: "Operación central",
          url: "/admin",
          icon: LayoutDashboard,
          isActive: pathname === "/admin",
          items: [
            {
              title: "Sucursales activas",
              url: "/admin",
            },
          ],
        },
        {
          title: "Sucursales",
          url: "/admin/branches",
          icon: Store,
          isActive: pathname.startsWith("/admin/branches"),
          items: [
            {
              title: "Estado operativo",
              url: "/admin/branches",
            },
          ],
        },
        {
          title: "Usuarios del sistema",
          url: usersUrl,
          icon: KeyRound,
          isActive: pathname.startsWith("/admin/users"),
          items: [
            {
              title: "Perfiles y permisos",
              url: usersUrl,
            },
          ],
        },
        {
          title: "Clientes globales",
          url: "/admin/customers",
          icon: Users,
          isActive: pathname.startsWith("/admin/customers"),
          items: [
            {
              title: "Base global",
              url: "/admin/customers",
            },
          ],
        },
        {
          title: "Configuración general",
          url: "/admin/settings",
          icon: Settings2,
          isActive: pathname.startsWith("/admin/settings"),
          items: [
            {
              title: "Servicios y parámetros",
              url: "/admin/settings",
            },
          ],
        },
        {
          title: "Integraciones",
          url: "/admin/integrations",
          icon: PlugZap,
          isActive: pathname.startsWith("/admin/integrations"),
          items: [
            {
              title: "Estado global",
              url: "/admin/integrations",
            },
          ],
        },
      ]
    }

    return [
      {
        title: "Resumen operativo",
        url: `/admin/${branchSlug}`,
        icon: LayoutDashboard,
        isActive: pathname === `/admin/${branchSlug}`,
        items: [
          { title: "Vista general", url: `/admin/${branchSlug}` },
          { title: "Alertas", url: `/admin/${branchSlug}` },
        ],
      },
      {
        title: "Pedidos",
        url: `/admin/${branchSlug}/orders`,
        icon: ClipboardList,
        isActive: pathname.startsWith(`/admin/${branchSlug}/orders`),
        items: [
          { title: "Pedidos activos", url: `/admin/${branchSlug}/orders` },
          { title: "Historial", url: `/admin/${branchSlug}/orders` },
        ],
      },
      {
        title: "Productos",
        url: `/admin/${branchSlug}/products`,
        icon: Package2,
        isActive: pathname.startsWith(`/admin/${branchSlug}/products`),
        items: [
          { title: "Catálogo online", url: `/admin/${branchSlug}/products` },
          { title: "Precios y stock", url: `/admin/${branchSlug}/products` },
          { title: "Imágenes y contenido", url: `/admin/${branchSlug}/products` },
        ],
      },
      {
        title: "Sucursales y horarios",
        url: `/admin/${branchSlug}/settings`,
        icon: Store,
        items: [
          { title: "Horarios de atención", url: `/admin/${branchSlug}/settings` },
          { title: "Cierres manuales", url: `/admin/${branchSlug}/settings` },
        ],
      },
      {
        title: "Clientes",
        url: `/admin/${branchSlug}/customers`,
        icon: Users,
        items: [
          { title: "Perfiles", url: `/admin/${branchSlug}/customers` },
          { title: "Historial de compras", url: `/admin/${branchSlug}/customers` },
        ],
      },
      {
        title: "Integraciones",
        url: `/admin/${branchSlug}/integrations`,
        icon: PlugZap,
        items: [
          { title: "Sincronización POS", url: `/admin/${branchSlug}/integrations` },
          { title: "Logs y errores", url: `/admin/${branchSlug}/integrations` },
        ],
      },
    ]
  }, [branchSlug, pathname, usersUrl])

  const quickLinks = React.useMemo(() => {
    if (!branchSlug) {
      return [
        {
          name: "Dashboard central",
          url: "/admin",
          icon: Blocks,
        },
        {
          name: "Sucursales",
          url: "/admin/branches",
          icon: Store,
        },
        {
          name: "Usuarios",
          url: "/admin/users",
          icon: ShoppingBasket,
        },
        {
          name: "Clientes globales",
          url: "/admin/customers",
          icon: Settings2,
        },
        {
          name: "Configuración general",
          url: "/admin/settings",
          icon: Store,
        },
        {
          name: "Integraciones",
          url: "/admin/integrations",
          icon: PlugZap,
        },
      ]
    }

    return [
      {
        name: "Dashboard principal",
        url: `/admin/${branchSlug}`,
        icon: Blocks,
      },
      {
        name: "Productos",
        url: `/admin/${branchSlug}/products`,
        icon: ShoppingBasket,
      },
      {
        name: "Storefront",
        url: `/tienda/${branchSlug}`,
        icon: Settings2,
      },
    ]
  }, [branchSlug])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={quickLinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
