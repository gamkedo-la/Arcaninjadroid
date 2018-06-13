//base class for HP and ATK
function StatsClass(LVL, HpMultiplier, DefMultiplier, AtkMultiplier)
{
	/* the first chunk of lines are base stats for any character but they will be modified depending on the character's lvl and 
		the passed in decimal values for multiplier.
		will hopefully feature:
		base HP, DEF, and ATK off the characters LVL.
		the ATK multiplier will also change ATK based on the length the player's combo
	*/
	this.baseHP = 300.0;
	this.hpMultiplier = HpMultiplier;
	this.baseDEF = 20.0;
	this.defMultiplier = DefMultiplier;
	this.baseATK = 30.0;
	this.atkMultiplier = AtkMultiplier;

	this.modifiedHP;
	this.modifiedDEF; 
	this.modifiedATK; 

	this.newHP;
	this.isCharacterDead = false;

	this.lvl = LVL;

	this.setStats = function()
	{
		this.setModifiedHP();
		this.setATK();
		this.setDEF();
	}

	//call this when the character is hit to update HP
	this.characterHasBeenHitSoCalculateNewHP = function(defenderDEF, attackerATK)
	{
		var netDamage = attackerATK - (defenderDEF * 0.5);
		this.newHP = this.modifiedHP - (netDamage);

		if (this.newHP <= 0) 
		{
			this.isCharacterDead = true;
		}
		else
		{
			this.isCharacterDead = false;
		}
	}

	this.calculateModifiedStat = function(stat, multiplier)
	{
		return (this.lvl * stat * multiplier);
	}

	//this should get called constantly to check if the player is in a combo or not and reflect the appropriate ATK values
	this.setComboMultiplier = function(currentCombo)
	{
		//increases by 1/20th of the current combo value and adds it to the ATK multiplier
		var comboMultiplier = currentCombo * 0.05;
		if(currentCombo > 1)
		{
			this.atkMultiplier += comboMultiplier;
		}
	}

	this.getNewHP = function()
	{
		return this.newHP;
	}

	this.hasModifiedHPBeenSet = false;
	this.setModifiedHP = function()
	{
		if(!this.hasModifiedHPBeenSet)
		{
			this.modifiedHP = calculateModifiedStat(this.baseHP, this.hpMultiplier);
			this.hasModifiedHPBeenSet = true;
		}
	}

	//this is mainly for the player to allow them to increase their HP as they level up
	this.characterGainedOrLossLvl = function()
	{
		this.hasModifiedHPBeenSet = false;
	}

	this.getModifiedHP = function()
	{
		return this.modifiedHP;
	}

	this.setDEF = function()
	{
		calculateModifiedStat(this.baseDEF, this.defMultiplier);
	}

	this.getDEF = function()
	{
		return this.modifiedDEF;
	}

	this.setATK = function()
	{
		calculateModifiedStat(this.baseATK, this.atkMultiplier);
	}

	this.getATK = function()
	{
		return this.modifiedATK;
	}
}