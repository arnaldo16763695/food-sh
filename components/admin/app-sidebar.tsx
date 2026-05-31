"use client"

import * as React from "react"
import {
  Blocks,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
