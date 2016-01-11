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
        this.score = 0;

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

        switch (key) {
            case 90: // Z
                tetris.blocActif.tourner();
                if (tetris.grille.verifCollision(tetris.blocActif)) {
                    tetris.blocActif.tourner();
                    tetris.blocActif.tourner();
                    tetris.blocActif.tourner();
                } else {
                    tetris.afficher();
                }
                break;
            case 81: // Q
                tetris.blocActif.depGauche();
                if (tetris.grille.verifCollision(tetris.blocActif)) {
                    tetris.blocActif.depDroite();
                } else {
                    tetris.afficher();
                }
                break;
            case 68: // D
                tetris.blocActif.depDroite();
                if (tetris.grille.verifCollision(tetris.blocActif)) {
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

    var random = Math.floor(Math.random() * 7) + 1;

    var bloc;

    switch (random) {
        case 1:
            bloc = new I();
            break;
        case 2:
            bloc = new J();
            break;
        case 3:
            bloc = new L();
            break;
        case 4:
            bloc = new O();
            break;
        case 5:
            bloc = new N();
            break;
        case 6:
            bloc = new S();
            break;
        case 7:
            bloc = new T();
            break;
    }

    this.blocActif = bloc;
    if (this.grille.verifCollision(this.blocActif)) {
        this.gameOver();
    }
};

Tetris.prototype.afficher = function () {

    this.grille.afficher(this.blocActif);
    this.$container.html("");
    this.$container.append(this.grille.$grille);

};

Tetris.prototype.run = function () {
    tetris.blocActif.depBas();
    if (tetris.grille.verifCollision(tetris.blocActif)) {
        tetris.blocActif.annuleDepBas();
        tetris.grille.placerBloc(tetris.blocActif);
        var nbLignesSuppr = tetris.grille.lignePleine();
        if (nbLignesSuppr > 0) {
            tetris.augmenterScore(nbLignesSuppr * (10 + ((nbLignesSuppr - 1) * 5)));
        }
        tetris.nouveauBloc();
    }
    tetris.afficher();
};

Tetris.prototype.gameOver = function () {
    clearInterval(this.interval);
    console.log("Game Over !");
};

Tetris.prototype.augmenterScore = function (nbPlus) {
    this.score += nbPlus;
    console.log(this.score);
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

    this.initGrille();

}

Grille.prototype.initGrille = function () {
    var lin, col;

    for (lin = 0; lin < this.NBLIN; lin++) {
        this.grille[lin] = [];
        for (col = 0; col < this.NBCOL; col++) {
            this.grille[lin][col] = null;
        }
    }
};

Grille.prototype.verifCollision = function (bloc) {
    var nbLin = bloc.bloc.length;
    var nbCol = bloc.bloc[0].length;

    var lin, col;

    for (lin = 0; lin < nbLin; lin++) {
        for (col = 0; col < nbCol; col++) {
            if (bloc.bloc[lin][col]) {
                if ((bloc.pos.lin + lin) >= this.NBLIN || (bloc.pos.lin + lin) < 0 || (bloc.pos.col + col) >= this.NBCOL || (bloc.pos.col + col) < 0 || this.grille[bloc.pos.lin + lin][bloc.pos.col + col] !== null) {
                    return true;
                }
            }
        }
    }
    return false;
};

Grille.prototype.placerBloc = function (bloc) {
    var nbLin = bloc.bloc.length;
    var nbCol = bloc.bloc[0].length;

    var lin, col;

    for (lin = 0; lin < nbLin; lin++) {
        for (col = 0; col < nbCol; col++) {
            if (bloc.bloc[lin][col]) {
                this.grille[bloc.pos.lin + lin][bloc.pos.col + col] = bloc.bloc[lin][col];
            }
        }
    }
    return true;
};

Grille.prototype.lignePleine = function () {
    var lin, col, flag;

    var supprlignes = [];

    for (lin = 0; lin < this.NBLIN; lin++) {
        flag = true;
        col = 0;
        while (flag && col < this.NBCOL) {
            if (this.grille[lin][col] == null) {
                flag = false;
            }
            col++;
        }

        if (flag) {
            console.log("Supprimer ligne " + lin);
            supprlignes.push(lin);
        }
    }

    this.supprLignes(supprlignes);

    return supprlignes.length;
};

Grille.prototype.supprLignes = function (lignes) {
    var lin, col, linSuppI;
    var nbLinSupp = lignes.length;

    for (linSuppI = 0; linSuppI < nbLinSupp; linSuppI++) {
        for (lin = lignes[linSuppI]; lin > 0; lin--) {
            for (col = 0; col < this.NBCOL; col++) {
                this.grille[lin][col] = this.grille[lin - 1][col];
            }
        }
    }

};

Grille.prototype.afficher = function (blocActif) {
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

    blocActif.afficher(this.$grille, unite);
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

Bloc.prototype.afficher = function ($grille, unite) {
    var nbLin = this.bloc.length;
    var nbCol = this.bloc[0].length;
    var carre, lin, col;

    for (lin = 0; lin < nbLin; lin++) {
        for (col = 0; col < nbCol; col++) {
            carre = this.bloc[lin][col];
            if (carre) {
                carre.afficher(unite, lin + this.pos.lin, col + this.pos.col);
                $grille.append(carre.$carre);
            }
        }
    }
};

/**
 * Classe I
 * @constructor
 */
function I() {
    Bloc.call(this);

    this.color = '#ff0101';

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
 * Classe J
 * @constructor
 */
function J() {
    Bloc.call(this);

    this.color = '#ff6d01';

    this.bloc = [
        [new Carre(this.color), null, null],
        [new Carre(this.color), new Carre(this.color), new Carre(this.color)]
    ];
}

J.prototype = Object.create(Bloc.prototype);
J.prototype.constructor = J;

/**
 * Classe L
 * @constructor
 */
function L() {
    Bloc.call(this);

    this.color = '#ffc001';

    this.bloc = [
        [null, null, new Carre(this.color)],
        [new Carre(this.color), new Carre(this.color), new Carre(this.color)]
    ];
}

L.prototype = Object.create(Bloc.prototype);
L.prototype.constructor = L;

/**
 * Classe O
 * @constructor
 */
function O() {
    Bloc.call(this);

    this.color = '#01ff13';

    this.bloc = [
        [new Carre(this.color), new Carre(this.color)],
        [new Carre(this.color), new Carre(this.color)]
    ];
}

O.prototype = Object.create(Bloc.prototype);
O.prototype.constructor = O;

/**
 * Classe N
 * @constructor
 */
function N() {
    Bloc.call(this);

    this.color = "#019cff";

    this.bloc = [
        [null, new Carre(this.color)],
        [new Carre(this.color), new Carre(this.color)],
        [new Carre(this.color), null]
    ];
}

N.prototype = Object.create(Bloc.prototype);
N.prototype.constructor = N;


/**
 * Classe S
 * @constructor
 */
function S() {
    Bloc.call(this);

    this.color = "#a801ff";

    this.bloc = [
        [new Carre(this.color), null],
        [new Carre(this.color), new Carre(this.color)],
        [null, new Carre(this.color)]
    ];
}

S.prototype = Object.create(Bloc.prototype);
S.prototype.constructor = S;

/**
 * Classe T
 * @constructor
 */
function T() {
    Bloc.call(this);

    this.color = "#ff0179";

    this.bloc = [
        [null, new Carre(this.color), null],
        [new Carre(this.color), new Carre(this.color), new Carre(this.color)]
    ];
}

T.prototype = Object.create(Bloc.prototype);
T.prototype.constructor = T;