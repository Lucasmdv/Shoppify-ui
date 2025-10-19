import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EndpointTest } from "./pages/endpoint-test/endpoint-test";
import { Footer } from './components/footer/footer';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('shoppify-ui');
}
