//base class for XP
function XPclass()
{
	/*all characters will start off at lvl 1.
		xp drop is currently based of the enemy's modified HP
		very likely that all calculations will need to change to get a decent balance 
	*/
	this.currentLVL = 1;
	this.nextLVL = this.lvl + 1;

	this.comboMultiplier = 1.0;
	this.multiplier = 1.0;

	this.xpDrop;	
	
	this.diff = this.xpForNextLVL - this.currentXP;

	this.getCurrentLVL = function()
	{
		return this.currentLVL;
	}

	this.setLVL = function()
	{
		if(this.diff <= 0)
		{
			this.currentLVL = this.nextLVL;
		}
	}

	this.calculateXPdrop = function(HP)
	{
		//calculates xp drop as a 1/1000th of the enemy's modified HP so a lvl 1 enemy drop .3 xp if their modified hp is 300
		//very much a WIP and will likely change to ensure stats are balanced or at least somewhat balanced
		this.xpDrop = HP * 0.001;
	}

	this.getXPdrop = function(modifiedHP, currentCombo)
	{
		/*quick rundown on what's going on here (using base stats for calculations): xp drop is .3 which is then multiplied by the combo multiplier. 
			if the current combo was 10 then the combo multiplier would change to 1.5
			after all that we multiply .3 by 1.5 which equals .45
			the xp required for the next lvl is 6 so that means 14 enemies that have 300 hp must be defeated to level up.
		*/ 
		this.calculateXPdrop(modifiedHP);
		this.setComboMultiplier(currentCombo)
		return this.xpDrop * this.comboMultiplier;
	}

	this.getCurrentXP = function()
	{
		return this.currentXP;
	}

	this.getXPtoNextLevel = function()
	{
		return this.xpForNextLVL;
	}

	this.calculateCurrentXP = function(lvl, multiplier)
	{
		if(lvl == 1)
		{
			return 0;
		}
		else
		{
			return (lvl * (lvl + 1)) * multiplier;
		}	
	}
	this.currentXP = this.calculateCurrentXP(this.currentLVL, this.multiplier);

	this.calculateNextXP = function(lvl, multiplier)
	{
		return (lvl * (lvl + 1)) * multiplier;
	}
	this.xpForNextLVL = this.calculateNextXP(this.nextLVL, this.multiplier);

	this.setComboMultiplier = function(combo)
	{
		var comboIncrement = combo * 0.05;
		if(combo > 1)
		{
			this.comboMultiplier += comboIncrement;
		}
	}

	//still not sure how this can be used... maybe if there's usables or something like that
	this.setXPmultiplier = function()
	{

	}
}