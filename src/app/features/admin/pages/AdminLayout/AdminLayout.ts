import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { Navbar } from "../../components/Navbar/Navbar";

@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, Navbar, RouterOutlet],
  templateUrl: './AdminLayout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {}
