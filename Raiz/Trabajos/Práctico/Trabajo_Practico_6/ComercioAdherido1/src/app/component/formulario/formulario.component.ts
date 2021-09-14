
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pedido } from 'src/app/models/pedido';
import { Router } from '@angular/router';
import { Ciudad} from 'src/app/models/ciudade';
import { ModoPago, ModoPagos } from 'src/app/models/modoPago';
import { CiudadesService } from 'src/app/services/ciudades.service';
import { MetodosPagoService } from 'src/app/services/metodos-pago.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { Direccion } from 'src/app/models/direccion';


@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {
  ciudadesDisponibles: Ciudad[] = [];
  modosPagoDisponible: ModoPago[] = [];
  
  datosEnviar: Pedido = 
  {
    descripcionProducto: "",
    ciudadComercio: "",
    calleComercio: "",
    numeroComercio: "",
    detalleComercio: "",
    ciudadCliente: "",
    calleCliente: "",
    numeroCliente: "",
    detalleCliente: "",
    fechaPedido: "",
    metodoPago: "",
  }

  paginaFormulario = 2;

  ciudadComercio: Ciudad = { nombre: " ", latitud: -31.413972040086794, longitud: -64.18537430820507 };
  ciudadCliente: Ciudad = { nombre: " ", latitud: -31.413972040086794, longitud: -64.18537430820507 };

  pedidoForm: FormGroup;  
  constructor(private router: Router
    , private formBuilder: FormBuilder
    , private ciudadesService: CiudadesService
    , private metodosPagoService: MetodosPagoService
    , private pedidosService: PedidosService
    ) { 
    
    this.pedidoForm = this.formBuilder.group({
      producto: ['', [Validators.required]],
      ciudadComercio: ['', [Validators.required]],
      calleComercio: [ '', [Validators.required]],
      numeroComercio: [ '', [Validators.required]],
      detalleUbicacionComercio: ['', [Validators.required]],
      ciudadCliente: ['', [Validators.required]],
      calleCliente: [ '', [Validators.required]],
      numeroCliente: [ '', [Validators.required]],
      detalleUbicacionCliente: ['', [Validators.required]],
      formaDePago: ['', [Validators.required]],
      fechaPedido: ['', [Validators.required]]
    });
    
    this.ciudadesService.getCiudades().subscribe(resp => {
      Object.keys(resp).
      forEach(key => this.ciudadesDisponibles.push({
                                                nombre: resp[key].nombre,
                                                latitud: resp[key].latitud,
                                                longitud: resp[key].longitud
                                                }));
    });

    this.metodosPagoService.getMetodosPago().subscribe(resp => {
      Object.keys(resp)
      .filter(key => resp[key].activo)
      .forEach(activeKey =>this.modosPagoDisponible.push({
                                                      modo: resp[activeKey].nombre
                                                      })
      )
    });
  }

  ngOnInit(): void {
  }
 
  onSubmit(value: Pedido): void {
    
    if(!this.pedidoForm.valid) return;
 
    let datosEnviar:Pedido = {
      descripcionProducto: this.pedidoForm.value.producto,
      ciudadComercio: this.pedidoForm.value.ciudadComercio,
      calleComercio: this.pedidoForm.value.calleComercio,
      numeroComercio: this.pedidoForm.value.numeroComercio,
      detalleComercio: this.pedidoForm.value.detalleUbicacionComercio,
      ciudadCliente: this.pedidoForm.value.ciudadCliente,
      calleCliente: this.pedidoForm.value.calleCliente,
      numeroCliente: this.pedidoForm.value.numeroCliente,
      detalleCliente: this.pedidoForm.value.detalleUbicacionCliente,
      fechaPedido: this.pedidoForm.value.fechaPedido,
      metodoPago: this.pedidoForm.value.formaDePago,
    }
    
    this.pedidosService.postPedido(datosEnviar).subscribe(resp => console.log(resp));
  }
  
  onChange($target:any)
  {
    if($target === null) return;

    let ciudad: Ciudad | undefined = this.ciudadesDisponibles
                                    .find(ciudad => ciudad.nombre == $target.value);
    if(ciudad === undefined) return;
    
    if(this.paginaFormulario == 2)
    {
      this.ciudadComercio = ciudad;
      return;
    } 
    this.ciudadCliente = ciudad;
  }

  onMapClick($event: Direccion): void {
    let ciudad = this.getCiudad($event.ciudad);
    let calle = $event.calle;
    let numero = $event.numero;

    let controles = this.pedidoForm.controls;
    if(this.paginaFormulario == 2)
    {
      controles.ciudadComercio.setValue(ciudad);
      controles.calleComercio.setValue(calle);
      controles.numeroComercio.setValue(numero);
      return;
    }
    controles.ciudadCliente.setValue(ciudad);
    controles.calleCliente.setValue(calle);
    controles.numeroCliente.setValue(numero);
  }

  siguientePagina(): void {
    this.paginaFormulario++;
  }

  anteriorPagina(): void {
    if(this.paginaFormulario>1)
      this.paginaFormulario--;
  }

  pagaConTarjeta() : boolean
  {
    let metodoPago:string = this.pedidoForm.value.formaDePago;

    return metodoPago.includes("tarjeta");
  }

  private getCiudad(nombreResultado: string) : string
  {
    let clean = this.cleanString(nombreResultado);
    let ciudadEncontrada = this.ciudadesDisponibles
                          .find(ciudad => {
                            let ciudadLimpia = this.cleanString(ciudad.nombre);
                            return ciudadLimpia.includes(clean);
                          });
    return ciudadEncontrada === undefined? "" : ciudadEncontrada.nombre;
  }

  //Saca los acentos porque habia un problema al comparar jesús maría
  private cleanString(toClean: string) : string
  {
    return toClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  }
}


