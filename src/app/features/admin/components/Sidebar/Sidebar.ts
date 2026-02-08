import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Route, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { adminMenuRoutes } from '../../Admin.routes';
import { LoginService } from 'src/app/features/auth/services/Login.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './Sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  openSubmenus = signal<{ [key: string]: boolean }>({});
  router = inject(Router);
  loginService = inject(LoginService);

  isActive(link: string): boolean {
    return this.router.url === link;
  }

  isSubmenuActive(children: { link: string }[]): boolean {
    return children.some(child => this.isActive(child.link));
  }

  adminMenu = signal(
    adminMenuRoutes
      .filter(r => r.path && r.title)
      .map(r => ({
        label: r.title as string,
        link: '/admin/' + r.path,
        icon: r.data?.['icon'] as string,
      }))

  );

  sidebarMenu = computed(() =>
    adminMenuRoutes.map(item => {
      if (item?.children && item?.title) {
        return {
          label: item.title as string,
          icon: item.data?.['icon'] as string,
          children: item.children.filter(c => c?.path && c?.title).map(c => ({
            label: c.title as string,
            link: '/admin/' + c.path,
            icon: c.data?.['icon'] as string
          }))
        };
      }
      if (item?.path && item?.title) {
        return {
          label: item.title as string,
          link: '/admin/' + item.path,
          icon: item.data?.['icon'] as string,
        };
      }
      return null;
    }).filter(Boolean)
  );

  toggleSubmenu(label: string | undefined | null) {
    if (!label) return;
    this.openSubmenus.update(val => ({
      ...val,
      [label]: !val[label]
    }));
  }

  isSidebarOpen = signal(false);

  openSidebar() {
    this.isSidebarOpen.set(true);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login'], {replaceUrl: true});
  }
}
