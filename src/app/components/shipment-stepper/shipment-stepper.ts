import { Component, Input, OnChanges } from '@angular/core';
import { Shipment, Status } from '../../models/shipment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipment-stepper',
  imports: [CommonModule],
  templateUrl: './shipment-stepper.html',
  styleUrl: './shipment-stepper.css',
})
export class ShipmentStepper implements OnChanges {
  @Input() shipment: Shipment | null = null;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';
  
  steps: Step[] = [];

  ngOnChanges() {
    this.updateSteps();
  }

  updateSteps() {
    if (!this.shipment) return;

    const status = this.shipment.status;
    const startDate = this.shipment.startDate;
    const endDate = this.shipment.endDate;


    
    const isProcessing = true; 
    const isShipped = status === Status.SHIPPED || status === Status.DELIVERED || status === Status.RETURNED; 
    const isDelivered = status === Status.DELIVERED;
    const isReturned = status === Status.RETURNED;
    const isCancelled = status === Status.CANCELLED;

    this.steps = [
      {
        title: 'En preparación',
        description: 'El vendedor está preparando tu paquete.',
        date: startDate,
        active: isProcessing && !isShipped && !isCancelled,
        completed: isShipped || isDelivered || isReturned, 
        isLast: false
      },
      {
        title: 'En camino',
        description: 'El vendedor despachó tu paquete.',
        date: isShipped ? startDate : undefined, 
        active: isShipped && !isDelivered && !isReturned,
        completed: isDelivered || isReturned,
        isLast: false
      },
      {
        title: isReturned ? 'Devuelto' : 'Entrega',
        description: isReturned ? 'El paquete fue devuelto.' : (isDelivered ? 'Llegó a tu domicilio.' : 'Llegará a tu domicilio.'),
        date: endDate,
        active: isDelivered || isReturned,
        completed: isDelivered || isReturned,
        isLast: true
      }
    ];

    if (isCancelled) {
       this.steps = [
        {
            title: 'Cancelado',
            description: 'El envío fue cancelado.',
            date: endDate,
            active: true,
            completed: true,
            isLast: true
        }
       ]
    }
  }
}

export interface Step {
  title: string;
  description: string;
  date?: Date;
  active: boolean;
  completed: boolean;
  isLast: boolean;
}
