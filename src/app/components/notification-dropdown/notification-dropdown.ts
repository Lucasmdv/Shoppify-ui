import { Component, OnInit } from '@angular/core';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective, BadgeComponent } from '@coreui/angular';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [DropdownComponent, DropdownMenuDirective, BadgeComponent, DropdownToggleDirective],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css'
})
export class NotificationDropdown implements OnInit {



notificationType: string = 'general'  
notifications : any[] = [
  {
    id: 1,
    type: 'general',
    message: 'General notification',
    read: false
  },

  {
    id: 3,
    type: 'general',
    message: 'General notification',
    read: false
  }
]

selectedNotifications: any[] = []

ngOnInit(){
  this.getGeneralNotifications()
}

getGeneralNotifications(){
  this.selectedNotifications = this.notifications.filter((notification) => notification.type === 'general')
  this.notificationType = 'general'
}

getProductNotifications(){
  this.selectedNotifications = this.notifications.filter((notification) => notification.type === 'product')
  this.notificationType = 'product'
}

getUnreadNotifications(){
  return this.notifications.filter((notification) => notification.read === false).length
}

}
