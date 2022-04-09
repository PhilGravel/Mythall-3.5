import { auth } from "../assets/js/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUser } from "../@mythall/users";
import { getPersonnagesFromUserId } from "../@mythall/personnages";

let currentUser;

class UserComponent extends HTMLElement {
  constructor() {
    super();

    onAuthStateChanged(auth, async user => {
      if (user == null) {
        return;
      }

      currentUser = await getUser(user.uid);
      this.querySelector("#name").innerHTML = `${currentUser.displayname}`;

      if (currentUser.roles.animateur == true || currentUser.roles.organisateur == true) {
        this.querySelector("#animateur").innerHTML = `
        <a href="/organisateur/personnages">Liste des personnages</a>
        `;
      }

      if (currentUser.roles.organisateur == true) {
        this.querySelector("#organisateur").innerHTML = `
        <a href="/organisateur/sorts">Liste des sorts</a>
        `;
      }

      const personnagesComponent = document.querySelector("personnages-component");
      await personnagesComponent.getPersonnages();
    });
  }
}

class PersonnagesComponent extends HTMLElement {
  constructor() {
    super();
  }

  getPersonnages = async () => {
    if (currentUser) {
      const personnages = await getPersonnagesFromUserId(currentUser.uid);

      // Make sure browser support template
      if ("content" in document.createElement("template")) {
        // Create a list of personnages
        personnages.forEach(personnage => {
          const clone = this.querySelector("template").content.cloneNode(true);
          clone.querySelector("#nom").textContent = personnage.nom;
          clone.querySelector("#personnage").href = `/personnage?id=${personnage.id}`;
          this.appendChild(clone);
        });
      }
    }
  };
}

customElements.define("user-component", UserComponent);
customElements.define("personnages-component", PersonnagesComponent);
