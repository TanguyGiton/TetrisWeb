/* =============================================================
 TETRIS
 =============================================================
 */

/**
 * Classe Tetris
 * @constructor
 */
function Tetris(id) {
    if ($(id).length == 0) {
        console.error("Le conteneur n'existe pas !")
    } else {

        this.$container = $(id);

        this.grille = new Grille();

        this.blocActif = null;
        this.nouveauBloc();

        this.events();

        this.afficher();

        this.interval = setInterval(this.run, 700);
    }

}

Tetris.prototype.events = function () {
    var tetris = this;

    $(window).keydown(function (e) {
        var key = e.keyCode || e.which;

        var maj;
        switch (key) {
            case 90: // Z
                tetris.blocActif.tourner();
                maj = tetris.grille.majGrille();
                if (!maj) {
                    tetris.blocActif.tourner();
                    tetris.blocActif.tourner();
                    tetris.blocActif.tourner();
                } else {
                    tetris.afficher();
                }
                break;
            case 81: // Q
                tetris.blocActif.depGauche();
                maj = tetris.grille.majGrille();
                if (!maj) {
                    tetris.blocActif.depDroite();
                } else {
                    tetris.afficher();
                }
                break;
            case 68: // D
                tetris.blocActif.depDroite();
                maj = tetris.grille.majGrille();
                if (!maj) {
                    tetris.blocActif.depGauche();
                } else {
                    tetris.afficher();
                }
                break;
            case 83: // S
                tetris.run();
                break;
        }
    });
};

Tetris.prototype.nouveauBloc = function () {

    this.grille.lignePleine();

    var random = Math.floor(Math.random() * 3) + 1;

    var bloc;

    switch (random) {
        case 1:
            bloc = new I();
            break;
        case 2:
            bloc = new N();
            break;
        case 3:
            bloc = new T();
            break;
    }

    this.blocActif = bloc;
    this.grille.ajouterBloc(bloc);
    if (!this.grille.majGrille()) {
        this.gameOver();
    }
};

Tetris.prototype.afficher = function () {

    this.grille.afficher();
    this.$container.html("");
    this.$container.append(this.grille.$grille);

};

Tetris.prototype.run = function () {
    tetris.blocActif.depBas();
    var maj = tetris.grille.majGrille();
    if (!maj) {
        tetris.blocActif.annuleDepBas();
        tetris.nouveauBloc();
    }

    tetris.afficher();
};

Tetris.prototype.gameOver = function () {
    clearInterval(this.interval);
    console.log("Game Over !");
};


/**
 * Classe Grille
 * @constructor
 */
function Grille() {

    this.NBCOL = 10;
    this.NBLIN = 18;

    this.width = 400;

    this.$grille = $(document.createElement('div'));

    this.grille = [];

    this.blocs = [];


    this.reinitGrille();

}

Grille.prototype.reinitGrille = function () {
    var lin, col;

    for (lin = 0; lin < this.NBLIN; lin++) {
        this.grille[lin] = [];
        for (col = 0; col < this.NBCOL; col++) {
            this.grille[lin][col] = null;
        }
    }
};

Grille.prototype.ajouterBloc = function (bloc) {
    this.blocs.unshift(bloc);
};

Grille.prototype.majGrille = function () {
    var nbBlocs = this.blocs.length;

    this.reinitGrille();

    for (var i = 0; i < nbBlocs; i++) {
        if (!this.placerBloc(this.blocs[i])) {
            return false;
        }
    }

    return true;
};

Grille.prototype.placerBloc = function (bloc) {
    var nbLin = bloc.bloc.length;
    var nbCol = bloc.bloc[0].length;

    var lin, col;

    for (lin = 0; lin < nbLin; lin++) {
        for (col = 0; col < nbCol; col++) {
            if (bloc.bloc[lin][col]) {
                if ((bloc.pos.lin + lin) >= this.NBLIN || (bloc.pos.lin + lin) < 0 || (bloc.pos.col + col) >= this.NBCOL || (bloc.pos.col + col) < 0 || this.grille[bloc.pos.lin + lin][bloc.pos.col + col] !== null) {
                    return false;
                } else {
                    this.grille[bloc.pos.lin + lin][bloc.pos.col + col] = bloc.bloc[lin][col];
                }
            }
        }
    }
    return true;
};

Grille.prototype.lignePleine = function () {
    var lin, col, flag;

    for (lin = 0; lin < this.NBLIN; lin++) {
        flag = true;
        col = 0;
        while (flag && col < this.NBCOL - 1) {
            if (this.grille[lin][col] == null) {
                flag = false;
            }
            col++;
        }

        if (flag) {
            console.log("supprimer ligne " + lin);
        }
    }
};

Grille.prototype.afficher = function () {
    var lin, col, carre;

    var unite = parseInt(this.width / this.NBCOL);

    this.$grille
        .attr("id", "tetris-grille")
        .width(unite * this.NBCOL)
        .height(unite * this.NBLIN)
        .css("position", "relative")
        .css("border", '1px solid #000')
        .html('');

    for (lin = 0; lin < this.NBLIN; lin++) {
        for (col = 0; col < this.NBCOL; col++) {
            if (this.grille[lin][col]) {
                carre = this.grille[lin][col];

                carre.afficher(unite, lin, col);

                this.$grille.append(carre.$carre);
            }
        }
    }
};

/**
 * Classe Carre
 * @constructor
 */
function Carre(color) {

    this.color = color;

    this.$carre = $(document.createElement('div'));
}

Carre.prototype.afficher = function (cote, lin, col) {
    this.$carre
        .width(cote)
        .height(cote)
        .css('background', this.color)
        .css('position', 'absolute')
        .css('top', lin * cote + 'px')
        .css('left', col * cote + 'px')
    ;
};


/**
 * Classe Bloc
 * @constructor
 */
function Bloc() {
    this.bloc = [];

    this.pos = {
        lin: 0,
        col: 0
    }
}

/**
 * Tourne le bloc de 90°
 */
Bloc.prototype.tourner = function () {
    var nbLin = this.bloc.length;
    var nbCol = this.bloc[0].length;

    var lin, col;
    var temp = [];

    for (col = 0; col < nbCol; col++) {
        temp[col] = [];
        for (lin = 0; lin < nbLin; lin++) {
            temp[col][lin] = null;
        }
    }

    for (lin = 0; lin < nbLin; lin++) {
        for (col = 0; col < nbCol; col++) {
            temp[col][(nbLin - 1) - lin] = this.bloc[lin][col];
        }
    }

    this.bloc = temp;
};

Bloc.prototype.depGauche = function () {
    this.pos.col--;
};

Bloc.prototype.depDroite = function () {
    this.pos.col++;
};

Bloc.prototype.depBas = function () {
    this.pos.lin++;
};

Bloc.prototype.annuleDepBas = function () {
    this.pos.lin--;
};

/**
 * Classe I
 * @constructor
 */
function I() {
    Bloc.call(this);

    this.color = '#c24646';

    this.bloc = [
        [new Carre(this.color)],
        [new Carre(this.color)],
        [new Carre(this.color)],
        [new Carre(this.color)]
    ];
}

I.prototype = Object.create(Bloc.prototype);
I.prototype.constructor = I;

/**
 * Classe N
 * @constructor
 */
function N() {
    Bloc.call(this);

    this.color = "#54a7c6";

    this.bloc = [
        [null, new Carre(this.color)],
        [new Carre(this.color), new Carre(this.color)],
        [new Carre(this.color), null]
    ];
}

N.prototype = Object.create(Bloc.prototype);
N.prototype.constructor = N;


/**
 * Classe T
 * @constructor
 */
function T() {
    Bloc.call(this);

    this.color = "#b567cd";

    this.bloc = [
        [null, new Carre(this.color), null],
        [new Carre(this.color), new Carre(this.color), new Carre(this.color)]
    ];
}

T.prototype = Object.create(Bloc.prototype);
T.prototype.constructor = T;