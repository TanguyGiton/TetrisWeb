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
        this.grille = new Grille(400);
        this.$side = $(document.createElement('div'));
        this.score = new Score();

        this.blocActif = null;
        this.nextbloc = this.getBlocAleatoire();
        this.nouveauBloc();

        this.$nextBloc = $(document.createElement('div'));

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

    this.blocActif = this.nextbloc;
    this.blocActif.pos.col = 4; // On centre le bloc à l'apparition
    this.blocActif.pos.lin = 0; // On centre le bloc à l'apparition
    this.nextbloc = this.getBlocAleatoire();

    if (this.grille.verifCollision(this.blocActif)) {
        this.gameOver();
        return false
    }

    return true
};

Tetris.prototype.getBlocAleatoire = function () {
    var random = Math.floor(Math.random() * 7) + 1;

    switch (random) {
        case 1:
            return new I();
            break;
        case 2:
            return new J();
            break;
        case 3:
            return new L();
            break;
        case 4:
            return new O();
            break;
        case 5:
            return new N();
            break;
        case 6:
            return new S();
            break;
        case 7:
            return new T();
            break;
    }
};

Tetris.prototype.afficher = function () {

    this.$container
        .css('position', 'relative')
        .css('width', (this.grille.width + 200) + 'px')
        .html("");

    this.grille.afficher(this.blocActif);
    this.$container.append(this.grille.$grille);

    this.$side
        .css('position', 'absolute')
        .css('left', this.grille.width + 'px')
        .css('top', 0)
        .css('width', '200px')
        .css('height', '100%')
        .css('background', '#e5e5e4')
        .css('padding-top', '15px')
        .html('<h4 style="text-align: center"><strong>SUIVANT</strong></h4>')
    ;

    var unite = parseInt(this.grille.width / this.grille.NBCOL);

    this.nextbloc.pos.lin = parseInt((4 - this.nextbloc.bloc.length) / 2);

    this.$nextBloc
        .css('position', 'relative')
        .css('height', (4 * unite) + 'px')
        .css('width', (this.nextbloc.bloc[0].length * unite) + 'px')
        .css('left', '50%')
        .css('margin-left', '-' + (this.nextbloc.bloc[0].length * unite) / 2 + 'px')
        .html('')
    ;

    this.nextbloc.afficher(this.$nextBloc, unite);
    this.$side.append(this.$nextBloc);

    this.score.afficher(0, this.grille.width);
    this.$side
        .append('<div style="height: 20px"></div>')
        .append(this.score.$score);

    this.$side
        .append('<div style="height: 20px"></div>')
        .append(
            '<h3 style="text-align: center">COMMANDES</h3>' +
            '<div style="padding: 10px 0 0 50px; font-size: 16px;">' +
            '<strong>Q</strong> gauche<br>' +
            '<strong>D</strong> droite<br>' +
            '<strong>Z</strong> tourner<br>' +
            '<strong>S</strong> descendre<br>' +
            '</div>'
        );

    this.$container.append(this.$side);


};

Tetris.prototype.run = function () {
    tetris.blocActif.depBas();
    if (tetris.grille.verifCollision(tetris.blocActif)) {
        tetris.blocActif.annuleDepBas();
        tetris.grille.placerBloc(tetris.blocActif);
        var nbLignesSuppr = tetris.grille.lignePleine();
        if (nbLignesSuppr > 0) {
            tetris.score.augmenterScore(nbLignesSuppr * (10 + ((nbLignesSuppr - 1) * 5)));
        }
        if (!tetris.nouveauBloc()) {
            return false;
        }
    }
    tetris.afficher();
    return true;
};

Tetris.prototype.gameOver = function () {
    alert("Game Over ! Score : " + this.score.points + " points");
    this.grille.initGrille();
    this.score.points = 0;
    this.nouveauBloc();
    this.afficher();
};


/**
 * Classe Grille
 * @constructor
 */
function Grille(width) {

    this.NBCOL = 10;
    this.NBLIN = 18;

    this.width = width;

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
        [new Carre(this.color), new Carre(this.color), null],
        [null, new Carre(this.color), new Carre(this.color)]
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
        [null, new Carre(this.color), new Carre(this.color)],
        [new Carre(this.color), new Carre(this.color), null]
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

/**
 * Classe Score
 * @constructor
 */

function Score() {
    this.points = 0;

    this.$score = $(document.createElement('div'));
}

Score.prototype.augmenterScore = function (nbPlus) {

    this.points += nbPlus;
};

Score.prototype.afficher = function () {
    this.$score
        .css('width', '100%')
        .css('text-align', 'center')
        .css('padding', '30px 0')
        .css('border-top', '1px solid #000')
        .css('border-bottom', '1px solid #000')
        .attr('id', 'tetris-score')
        .append('<div style="height: 20px"></div>')
        .html(
            '<h3 style="text-align: center; margin-top: 0">SCORE</h3>' +
            "<strong>" + this.points + ' points</strong>'
        )
    ;
};