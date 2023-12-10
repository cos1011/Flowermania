const db = require('../../utils/database');

module.exports = class Order {
    constructor() {
    }


    static fetchData(){
        return db.execute('SELECT * FROM flowers');
    }

    static addDoc(name, price, description, imgUrl) {
        return db.execute('INSERT INTO flowers (name, price, description, imgUrl) VALUES (?, ?, ?, ?)',
            [name, price, description, imgUrl ]
            )

    }

    static getFlower(id) {
        return db.execute('SELECT * FROM flowers WHERE flowers.id = ?', [id])
    }

}