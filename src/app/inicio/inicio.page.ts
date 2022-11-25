import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  data: any;
  userData = JSON.parse(localStorage.getItem("userData"));
  clases: any;

  baseUrl = 'https://pia-api-duoc.herokuapp.com';

  constructor(
    private barcodeScanner: BarcodeScanner,
    private readonly alertController: AlertController,
  ) { }

  ngOnInit() {
    console.log('USER', this.userData);
    this.clases = this.getClassesByUser();
  }

  scanCode() {
    this.data = null;
    this.barcodeScanner.scan().then(async barcodeData => {
      console.log('Barcode data', barcodeData);
      this.data = barcodeData;

      // get user data from local storage
      const userData = JSON.parse(localStorage.getItem("userData"));

      // send request to server

      const res = await (await fetch(`${this.baseUrl}/attendance/class/${this.data.text}/alumno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })).json()

      if(res.ramo){
        const alert = await this.alertController.create({
          header: 'Asistencia registrada',
          message: `Asistencia registrada para el ramo "${res.ramo}"`,
          buttons: ['OK']
        });
        await alert.present();
        return;
      } else {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `No se pudo registrar la asistencia`,
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

    }).catch(err => {
      console.log('Error', err);
    });
  }

  async crearClase() {
    // get user data from local storage
    const userData = JSON.parse(localStorage.getItem("userData"));

    // create new class
    const clase = {
      ramo: 'Clase de prueba',
      descripcion: 'Esta es una clase de prueba',
      profesor: userData,
      alumnos: []
    };

    // send request to server
    const claseResponse = await (await fetch(`${this.baseUrl}/attendance/class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clase),
    })).json();

    const qrCode = await (await fetch(`${this.baseUrl}/attendance/class/${claseResponse._id}/qrcode`)).json();

    console.log({ claseResponse, qrCode });

    const alert = await this.alertController.create({
      header: 'Clase creada',
      message: `<img src="${qrCode.image}">`,
      buttons: ['OK']
    });
    await alert.present();
    return;
  }

  getClassesByUser() {
    // get user data from local storage
    const userData = JSON.parse(localStorage.getItem("userData"));

    // send request to server
    const response = fetch(`${this.baseUrl}/attendance/profesor/${userData._id}/classes`).then(res => res.json());
    return response;
  }

}
