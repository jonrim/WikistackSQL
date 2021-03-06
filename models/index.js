var marked = require('marked');
var Sequelize = require('sequelize');
var db = new Sequelize('postgres://postgres:password@localhost:5432/wikistack', {
	logging: false
});


var Page = db.define('page', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    urlTitle: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('open', 'closed'),
    },
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    tags: {
    		type: Sequelize.ARRAY(Sequelize.TEXT),
    }
}, {
  getterMethods : {
    route : function()  { return '/wiki/' + this.urlTitle },
    renderedContent : function() { return marked(this.content) }
  }
});

function generateUrlTitle (title) {
  if (title) {
    // Removes all non-alphanumeric characters from title
    // And make whitespace underscore
    return title.replace(/\s+/g, '_').replace(/\W/g, '');
  } else {
    // Generates random 5 letter string
    return Math.random().toString(36).substring(2, 7);
  }
}

Page.hook('beforeValidate', function(page, options) {
	page.urlTitle = generateUrlTitle(page.title);
})

var User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        isEmail: true,
        allowNull: false
    }
});

Page.belongsTo(User, {as: 'author'});



module.exports = {
  Page: Page,
  User: User
};