exports = module.exports = function(req, res) {

	var locals = res.locals;
    var fs = require('fs');

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'competitive';
	locals.cSection = 'ladderWeek';
	locals.ratingTypeTitle = 'Ladder Week';
	locals.ratingType = 'ladder1v1';
	locals.apiURL = process.env.API_URL;
    locals.members = [];
    locals.lastPage = [];
    
    fs.readFile('members/ladderWeek.json', 'utf8', function (err, str) {
        locals.rankingCategories = JSON.parse(str).playerData;
        for (const category in locals.rankingCategories){
            locals.members[category] = [];
            for (let i =0 ;i < locals.rankingCategories[category].data; i++){
                const member = locals.rankingCategories[category].data[i];
                const listElement = {'label': member.name, 'value': i};
                locals.members[category].push(listElement);
            }
        }
        res.render('ladderWeek');
	});

};
