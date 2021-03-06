import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {User} from '../models/user.model';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;
  loggedIn : boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if(user){
          console.log("logged in");
          this.loggedIn = true;
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }else{
          this.loggedIn = false;
          return of(null);
        }
      })
    );
  }

  async googleSignin(){
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async signOut(){
    this.afAuth.signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData(user){
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    }

    return userRef.set(userData, {merge: true});
  }
}
