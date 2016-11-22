var Settings;
var monitorLabelsEnabled;
var justInstalled = getUrlValue(location.href, "action") == "install";
var permissionWindow;
var userResponsedToPermissionWindow;
var playing;

var langs =
	[['Afrikaans',       ['af-ZA']],
	 ['Bahasa Indonesia',['id-ID']],
	 ['Bahasa Melayu',   ['ms-MY']],
	 ['Català',          ['ca-ES']],
	 ['Čeština',         ['cs-CZ']],
	 ['Deutsch',         ['de-DE']],
	 ['English',         ['en-AU', 'Australia'],
	                     ['en-CA', 'Canada'],
	                     ['en-IN', 'India'],
	                     ['en-NZ', 'New Zealand'],
	                     ['en-ZA', 'South Africa'],
	                     ['en-GB', 'United Kingdom'],
	                     ['en-US', 'United States']],
	 ['Español',         ['es-AR', 'Argentina'],
	                     ['es-BO', 'Bolivia'],
	                     ['es-CL', 'Chile'],
	                     ['es-CO', 'Colombia'],
	                     ['es-CR', 'Costa Rica'],
	                     ['es-EC', 'Ecuador'],
	                     ['es-SV', 'El Salvador'],
	                     ['es-ES', 'España'],
	                     ['es-US', 'Estados Unidos'],
	                     ['es-GT', 'Guatemala'],
	                     ['es-HN', 'Honduras'],
	                     ['es-MX', 'México'],
	                     ['es-NI', 'Nicaragua'],
	                     ['es-PA', 'Panamá'],
	                     ['es-PY', 'Paraguay'],
	                     ['es-PE', 'Perú'],
	                     ['es-PR', 'Puerto Rico'],
	                     ['es-DO', 'República Dominicana'],
	                     ['es-UY', 'Uruguay'],
	                     ['es-VE', 'Venezuela']],
	 ['Euskara',         ['eu-ES']],
	 ['Français',        ['fr-FR']],
	 ['Galego',          ['gl-ES']],
	 ['Hrvatski',        ['hr_HR']],
	 ['IsiZulu',         ['zu-ZA']],
	 ['Íslenska',        ['is-IS']],
	 ['Italiano',        ['it-IT', 'Italia'],
	                     ['it-CH', 'Svizzera']],
	 ['Magyar',          ['hu-HU']],
	 ['Nederlands',      ['nl-NL']],
	 ['Norsk bokmål',    ['nb-NO']],
	 ['Polski',          ['pl-PL']],
	 ['Português',       ['pt-BR', 'Brasil'],
	                     ['pt-PT', 'Portugal']],
	 ['Română',          ['ro-RO']],
	 ['Slovenčina',      ['sk-SK']],
	 ['Suomi',           ['fi-FI']],
	 ['Svenska',         ['sv-SE']],
	 ['Türkçe',          ['tr-TR']],
	 ['български',       ['bg-BG']],
	 ['Pусский',         ['ru-RU']],
	 ['Српски',          ['sr-RS']],
	 ['한국어',            ['ko-KR']],
	 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
	                     ['cmn-Hans-HK', '普通话 (香港)'],
	                     ['cmn-Hant-TW', '中文 (台灣)'],
	                     ['yue-Hant-HK', '粵語 (香港)']],
	 ['日本語',           ['ja-JP']],
	 ['Lingua latīna',   ['la']]];

if (bg.getSettings) {
	Settings = bg.getSettings();
}

chrome.windows.onRemoved.addListener(function(windowId) {
	if (permissionWindow && permissionWindow.id == windowId) {
		// closed permission window
		permissionWindow = null;
	}
});

function reloadExtension() {
	if (chrome.runtime.reload) {
		chrome.runtime.reload();
	} else {
		niceAlert("You must disable/re-enable the extension in the extensions page or restart the browser");
	}
}

function showOptionsSection(optionsSection) {
	console.log("showOptionsSection: " + optionsSection)
	if ($("#mainTabs")[0]) {
		$("#mainTabs")[0].selected = optionsSection;
	}
	if ($("#pages")[0]) {
		$("#pages")[0].selected = optionsSection;
	}

	var emailParam = getUrlValue(location.href, "accountEmail", true);
	if (optionsSection == "accounts") {
		if (emailParam) {
			loadAccountsOptions({selectedEmail:emailParam});
		} else {
			setTimeout(function() {
				loadAccountsOptions();
			}, 500)
		}
	}
}

function initSelectedTab() {
	var tabId = location.href.split("#")[1];
	
	if (tabId) {
		// detect if this options windows was opened by the configure button via the ANTP window ie. options.html#%7B%22id%22%3A%22pafgehkjhhdiomdpkkjhpiipcnmmigcp%22%7D which decodes to options.html#{"id":"pafgehkjhhdiomdpkkjhpiipcnmmigcp"}
		var id;
		try {
			id = JSON.parse( decodeURIComponent(window.location.hash).substring(1) ).id
		} catch (e) {
			// do nothing
		}
		
		if (id) {
			showOptionsSection("widget");
		} else {
			showOptionsSection(tabId);	
		}
	} else {
		showOptionsSection("notifications");
	}
}

function openPermissionWindow(oauthObject) {
	oauthObject.openPermissionWindow().then(permissionWindow => {
		window.permissionWindow = permissionWindow;
		userResponsedToPermissionWindow = false;
		
		// detect when window is closed to remove loading message
		var pollTimer = setInterval(function() {
		    if (!permissionWindow) {
		        clearInterval(pollTimer);
		        console.log("userResponsedToPermissionWindow: " + userResponsedToPermissionWindow);
		        // check if the user just closed window without accepting permission, if so just hide the loading
		        if (!userResponsedToPermissionWindow) {
		        	hideLoading();
		        }
		    }
		}, 4000);
		
		showLoading();
	});
}

function getSelectedAccount() {
	return $("#monitorLabels").data("account");
}

function saveSetting(key, value) {
	return getSelectedAccount().saveSetting(key, value);
}

function getAlias() {
	return Settings.read("donationClicked") ? $("#alias").val() : null;
}

function pollAndLoad(pollAccountsParams, callback) {
	callback = initUndefinedCallback(callback); 
	
	showLoading()
	bg.pollAccounts(pollAccountsParams).then(function() {
		loadAccountsOptions(pollAccountsParams);
	}).catch(error => {
		showError(error);
	}).then(() => {
		hideLoading();
		callback();
	});
}

function setColors() {
	setAccountGradient($("#colorEmail"), $("#colorStart").val(), $(
			"#colorEnd").val());
	$("#colorEmailMessageArea").css("background-color",
			$("#colorStart").val());
}

function addPaperItem(params) { // node, value, label, prepend
	var paperItem;
	
	if (params.icon) {
		paperItem = document.createElement("paper-icon-item");
		var $ironIcon = $("<iron-icon item-icon/>").attr("icon", params.icon);
		$(paperItem).empty(); // patch seems polymer would add shadydom when creating the paper-icon-item so i had to remove it
		$(paperItem).append($ironIcon);
		$(paperItem).append(params.label);
	} else {
		paperItem = document.createElement("paper-item");
		var textNode = document.createTextNode(params.label);
		paperItem.appendChild(textNode);
	}
	
	paperItem.setAttribute("value", params.value);
	
	if (params.prepend) {
		params.node.insertBefore(paperItem, params.node.firstChild);
	} else {
		params.node.appendChild(paperItem);
	}
}

function addSeparator(node, prepend) {
	var paperItem = document.createElement("paper-item");
	paperItem.setAttribute("class", "separator");
	paperItem.setAttribute("disabled", "");
	
	if (prepend) {
		node.insertBefore(paperItem, node.firstChild);
	} else {
		node.appendChild(paperItem);
	}
}

function generateSoundOptions(account, labelValue) {
	var template = $("#soundsDropDown")[0];
	if (template) {
		template = template.cloneNode(true);
		var $template = $(template.content);
		var paperMenuDiv = template.content.querySelector("paper-menu");
		
		$template.find("paper-dropdown-menu").attr("label", getMessage("notificationSound"));
	
		var sounds = Settings.read("customSounds");
		if (sounds && sounds.length) {
			addSeparator(paperMenuDiv);
			$.each(sounds, function(index, sound) {
				addPaperItem({node:paperMenuDiv, value:"custom_" + sound.name, label:sound.name});
			});
		}
		
		addSeparator(paperMenuDiv);
		addPaperItem({node:paperMenuDiv, value:"custom", label:getMessage("uploadSound"), icon:"cloud-upload"});
		addPaperItem({node:paperMenuDiv, value:"record", label:getMessage("recordSound"), icon:"av:mic"});

		var dropdown = document.importNode(template.content, true);
		var $dropdown = $(dropdown);
		var $paperMenu = $dropdown.find("paper-menu");
	
		initMessages($dropdown.find("paper-item, paper-icon-item"));
		
		var defaultValue = Settings.read("notificationSound");
		
		if (account) {
			var settingValue = account.getSettingForLabel("sounds", labelValue, defaultValue);
			$paperMenu[0].setAttribute("selected", settingValue);
		} else {
			$paperMenu[0].setAttribute("selected", defaultValue);
		}
		
		if (account) {
			initPaperElement($paperMenu, {mustDonate:true, account:account, key:"sounds", label:labelValue});
		}
		
		$paperMenu.find("paper-item, paper-icon-item").click(function(event) {
			var $paperMenu = $(this).closest("paper-menu");
			var soundName = $(this).attr("value");
			
			if (!account) {
				$("#playNotificationSound").css("display", "block");

				if (soundName) {
					$("#soundOptions").fadeIn();
				} else {
					$("#soundOptions").hide();
				}
			}

			if (soundName && soundName != "custom" && soundName != "record") {
				playSound(soundName);
			}

			if (soundName == "custom") {
				if (!account || Settings.read("donationClicked")) {
					openSoundDialog({$paperMenu:$paperMenu, account:account, labelValue:labelValue});
				} else {
					// do nothing cause the initOptions will take care of contribute dialog
				}
			} else if (soundName == "record") {
				if (!account || Settings.read("donationClicked")) {
					var mediaStream;
					var mediaRecorder;
					var chunks = [];
					var blob;
					
					var $dialog = initTemplate("recordSoundDialogTemplate");
					var $recordSoundWrapper = $dialog.find(".recordSoundWrapper");
					var $recordSound = $dialog.find("#recordSoundButton");
					$recordSound.off().on("click", function() {
						if ($recordSoundWrapper.hasClass("recording")) {
							
							mediaRecorder.stop();
							
							mediaStream.getTracks().forEach(function(track) {
								track.stop();
							});
							
							blob = new Blob(chunks, { 'type' : 'audio/webm' }); //  'audio/webm'  OR   audio/ogg; codecs=opus
							blobToBase64(blob).then(function(response) {
								$dialog.find("source")[0].src = response;
								
								$dialog.find("audio")[0].load();
								$dialog.find("audio")[0].play();
								
								$recordSoundWrapper.removeClass("recording");
								$recordSoundWrapper.addClass("recordedSound");
								
								$dialog.find(".buttons").removeAttr("hidden");
							}).catch(function(error) {
								showError(error);
							});
							
						} else {
							navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
							navigator.getUserMedia({audio: true}, function(responseMediaStream) {
								mediaStream = responseMediaStream;
								$dialog.off().on("iron-overlay-closed", function() {
									mediaStream.getAudioTracks()[0].stop();
									$recordSoundWrapper.removeClass("recordedSound");
									$recordSoundWrapper.removeClass("recording");
								});
								
								chunks = [];
								mediaRecorder = new MediaRecorder(mediaStream);
								mediaRecorder.start();
								mediaRecorder.ondataavailable = function(e) {
									chunks.push(e.data);
								}
								mediaRecorder.onwarning = function(e) {
								    console.warn('mediarecord wraning: ' + e);
								};
								mediaRecorder.onerror = function(e) {
									console.error('mediarecord error: ' + e);
									showError(e);
								};
								
								$recordSoundWrapper.removeClass("recordedSound");
								$recordSoundWrapper.addClass("recording");
							}, function(error) {
								showError(error.name);
							});
						}
					});
					
					$dialog.find(".okDialog").off().click(function() {
						if ($("#recordedSoundTitle")[0].validate()) {
							addCustomSound({$paperMenu:$paperMenu, account:account, labelValue:labelValue, title:$("#recordedSoundTitle").val(), data:$dialog.find("source")[0].src, overwrite:true});
							$dialog[0].close();
							showMessage(getMessage("done"));
						}
					});
					
					openDialog($dialog).then();
				}
			} else if (!account) {
				Settings.store("notificationSound", soundName).catch(error => {
					showError(error);
				});
			}
		});
		
		$("#notificationsGuide").click(function() {
			showOptionsSection("notifications");
			sendGA("guide", "notifications");
		});
		
		$("#browserButtonAction").click(function() {
			$("#browserButtonActionToolTip").hide();
		});
		
		$("#makeButtonOpenGmailGuide").click(function() {
			showOptionsSection("general");
			$("#browserButtonActionToolTip").show();
			$("#browserButtonActionToolTip")[0].show();
			sendGA("guide", "openGmail");
		});
		
		$("#guideForPrimaryCategory").click(function() {
			showOptionsSection("accounts");

			setTimeout(function() {
				$("#accountsListToolTip").show();
				$("#accountsListToolTip")[0].show();
			}, 500);
			
			setTimeout(function() {
				if ($("#inboxLabelToolTip").length) {
					$("#inboxLabelToolTip").show();
					$("#inboxLabelToolTip")[0].show();
				}
			}, 2500);
			
			setTimeout(function() {
				$("#primaryLabelToolTip").show();
				$("#primaryLabelToolTip")[0].show();
			}, 4000);
			
			sendGA("guide", "primaryCategory");
		});

		$("#guideForInboxByGmail").click(function() {
			showOptionsSection("accounts");
			
			setTimeout(function() {
				$(".inboxByGmailToolTip").first()[0].show();
				setTimeout(function() {
					$(".inboxByGmailToolTip").first()[0].hide();
				}, seconds(4))
			}, 500)
			
			sendGA("guide", "inboxByGmail");
		});
	}
	
	return $dropdown;
}

function generateVoiceOptions(account, labelValue) {
	var template = $("#voiceHearOptionsDropDown")[0];
	if (template) {
		template = template.cloneNode(true);
		var $template = $(template.content);
		var paperMenuDiv = template.content.querySelector("paper-menu");
		
		$template.find("paper-dropdown-menu").attr("label", getMessage("hearEmail"));
	
		if (account) {
			addSeparator(paperMenuDiv, true);
			addPaperItem({node:paperMenuDiv, value:"", label:getMessage("off"), prepend:true});
		}

		var dropdown = document.importNode(template.content, true);
		var $dropdown = $(dropdown);
		var $paperMenu = $dropdown.find("paper-menu");
	
		initMessages($dropdown.find("*"));
		
		var defaultValue = Settings.read("voiceHear");
		
		if (account) {
			var settingValue = account.getSettingForLabel("voices", labelValue, defaultValue);
			$paperMenu[0].setAttribute("selected", settingValue);
		} else {
			$paperMenu[0].setAttribute("selected", defaultValue);
		}
		
		$paperMenu.find("paper-item").click(function() {
			var $paperMenu = $(this).closest("paper-menu");
			var voiceValue = $(this).attr("value");
			
			var storagePromise;
			if (account) {
				storagePromise = account.saveSettingForLabel("voices", labelValue, voiceValue);
			} else {
				storagePromise = Settings.store("voiceHear", voiceValue);
			}
			storagePromise.catch(error => {
				showError(error);
			});
		});
	}
	
	return $dropdown;	
}

// desc: stores labelvalue in monitorlabelline node
function generateMonitorLabelOptions(account, title, labelValue, icon) {
	if (icon == "NONE") {
		icon = "";
	} else if (!icon) {
		icon = "icons:label";
	}
	
	var monitorColumn;
	var otherCategories = labelValue == SYSTEM_SOCIAL || labelValue == SYSTEM_PROMOTIONS || labelValue == SYSTEM_UPDATES || labelValue == SYSTEM_FORUMS;

	var $monitorLabelLine = $("<div class='monitorLabelLine layout horizontal center'><paper-checkbox class='monitoredLabelCheckbox flex'><div class='layout horizontal'><iron-icon class='labelIcon'></iron-icon> <div class='label'></div></div></paper-checkbox> <div class='soundOptionsWrapper'></div> <div class='voiceOptionsWrapper'></div> <div><paper-icon-button icon='social:notifications' class='toggleIcon notification'></paper-icon-button><paper-tooltip animation-delay='0' class='desktopNotificationsTooltip'></paper-tooltip></div> <div><paper-icon-button class='toggleIcon tab' icon='icons:tab'></paper-icon-button><paper-tooltip animation-delay='0' class='tabTooltip'></paper-tooltip></div></div>");
	$monitorLabelLine.find(".labelIcon").attr("icon", icon);
	if (!Settings.read("donationClicked")) {
		$monitorLabelLine.find(".soundOptionsWrapper").attr("mustDonate", "");
	}
	Polymer.dom($monitorLabelLine.find(".desktopNotificationsTooltip")[0]).textContent = getMessage("showDesktopNotifications");
	Polymer.dom($monitorLabelLine.find(".tabTooltip")[0]).textContent = getMessage("tabToolTip");

	if (labelValue == SYSTEM_INBOX) {
		$monitorLabelLine.append("<paper-tooltip id='inboxLabelToolTip' position='right' manual-mode='true'>" + getMessage("uncheckInboxLabel") + ". This is used for the classic Gmail inbox" + "</paper-tooltip>");
	}
	if (labelValue == SYSTEM_IMPORTANT_IN_INBOX) {
		$monitorLabelLine.addClass("importantInInbox");
	}
	if (labelValue == SYSTEM_PRIMARY) {
		$monitorLabelLine.addClass("primaryCategory");
		$monitorLabelLine.off().on("mousemove", function() {
			$(".otherCategories").slideDown();
		});
		$monitorLabelLine.append("<paper-tooltip id='primaryLabelToolTip' position='right' manual-mode='true'>" + getMessage("checkPrimaryOrMore") + ". This adds them to the count and the popup window" + "</paper-tooltip>");
	}
	$monitorLabelLine.data("labelValue", labelValue);
	$monitorLabelLine.find(".monitoredLabelCheckbox").attr("title", title);
	$monitorLabelLine.find(".label")
		.text(title)
	;
	
	if (monitorLabelsEnabled.indexOf(labelValue) != -1) {		
		$monitorLabelLine.find(".monitoredLabelCheckbox")[0].checked = true;

		var $soundOptions = generateSoundOptions(account, labelValue);
		var $voiceOptions = generateVoiceOptions(account, labelValue);
		
		$monitorLabelLine.find(".soundOptionsWrapper").append($soundOptions);
		$monitorLabelLine.find(".voiceOptionsWrapper").append($voiceOptions);
	} else {
		$monitorLabelLine.addClass("disabledLine");
	}
	
	// sound notifications are handled inside generateSoundOptions()
	// voice notifications are handled inside generateVoiceOptions()
	
	var settingValue;

	// desktop notifications
	settingValue = account.getSettingForLabel("notifications", labelValue, Settings.read("desktopNotification"));
	if (settingValue) {
		$monitorLabelLine.find(".notification").attr("enabled", "");
	}
	$monitorLabelLine.find(".notification").click(function() {
		var $this = $(this);
		$this.toggleAttr("enabled");
		var enabled = $this.attr("enabled") != undefined;
		account.saveSettingForLabel("notifications", labelValue, enabled).catch(error => {
			showError(error);
		});
	});

	// tabs
	settingValue = account.getSettingForLabel("tabs", labelValue, false);
	$monitorLabelLine.find(".tab").toggleAttr("enabled", settingValue);
	$monitorLabelLine.find(".tab").click(function() {
		if (Settings.read("donationClicked")) {
			var $this = $(this);
			$this.toggleAttr("enabled");
			var enabled = $this.attr("enabled") != undefined;
			account.saveSettingForLabel("tabs", labelValue, enabled);
		} else {
			openContributeDialog("tabForLabel");
		}
	});

	return $monitorLabelLine;
}

function getEnabledLabels() {
	var values = [];
	
	// loop through lines to pull data and then see if checkbox inside line is checked
	$(".monitorLabelLine").each(function() {
		var labelValue = $(this).data("labelValue");
		if ($(this).find(".monitoredLabelCheckbox[checked]").length) {
			values.push(labelValue);
		}
	});
	return values;
}

function addCollapse($monitorLabels, opened, title) {
	var $header = $("<div class='layout horizontal accountsLabelsHeader expand' style='padding:10px 20px;position:relative;cursor:pointer'>");
	$header.append("<paper-ripple>");
	var $expand = $("<iron-icon icon='expand-more' style='margin-left:5px'>");
	$monitorLabels.append($header.append(title, $expand));
	var $collapse = $("<iron-collapse>");
	if (opened) {
		$collapse.attr("opened", "");
		$header.addClass("opened");
	}
	
	$header.off().on("click", function() {
		$collapse[0].toggle();
		$header.toggleClass("opened");
	});
	
	$monitorLabels.append($collapse);
	return $collapse;
}

function loadLabels(params) {
	console.log("load labels");
	var account = params.account;
	
	var $monitorLabels = $("#monitorLabels");
	$monitorLabels.data("account", account);
	
	if (account) {
		$monitorLabels.empty();
		
		monitorLabelsEnabled = account.getMonitorLabels();
		
		var $option, $collapse;

		var systemLabelsOpened = !account.isUsingGmailCategories() || monitorLabelsEnabled.indexOf(SYSTEM_INBOX) != -1 || monitorLabelsEnabled.indexOf(SYSTEM_IMPORTANT) != -1 || monitorLabelsEnabled.indexOf(SYSTEM_IMPORTANT_IN_INBOX) != -1 || monitorLabelsEnabled.indexOf(SYSTEM_ALL_MAIL) != -1;
		$collapse = addCollapse($monitorLabels, systemLabelsOpened, getMessage("systemLabels"));
		
		$option = generateMonitorLabelOptions(account, getMessage("inbox"), SYSTEM_INBOX, "icons:inbox");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("importantMail"), SYSTEM_IMPORTANT, "icons:info-outline");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("importantMail") + " in " + getMessage("inbox"), SYSTEM_IMPORTANT_IN_INBOX, "icons:info-outline");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("allMail"), SYSTEM_ALL_MAIL, "communication:present-to-all");
		$collapse.append($option);
		
		var categoryLabelsOpened = !systemLabelsOpened || account.isMaybeUsingGmailCategories() || hasMainCategories(monitorLabelsEnabled);
		$collapse = addCollapse($monitorLabels, categoryLabelsOpened, getMessage("categories"));

		$option = generateMonitorLabelOptions(account, getMessage("primary"), SYSTEM_PRIMARY, "icons:inbox");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("social"), SYSTEM_SOCIAL, "social:people");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("promotions"), SYSTEM_PROMOTIONS, "maps:local-offer");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("updates"), SYSTEM_UPDATES, "icons:flag");
		$collapse.append($option);
		$option = generateMonitorLabelOptions(account, getMessage("forums"), SYSTEM_FORUMS, "communication:forum");
		$collapse.append($option);
		
		//$monitorLabels.append($("<div style='height:5px'>&nbsp;</div>"));
		
		$collapse = addCollapse($monitorLabels, true, getMessage("labels"));

		var $spinner = $("<paper-spinner active style='margin-left:20px'>");
		$monitorLabels.append($spinner);
		
		account.getLabels(params.refresh).then(response => {
			if (response.labels) {
				$.each(response.labels, function(i, label) {
					$option = generateMonitorLabelOptions(account, label.name, label.id);
					$collapse.append($option);
				});
			}
		}).catch(error => {
			$monitorLabels.append( $("<div style='color:red;padding:5px'>").text(error) );
		}).then(() => {
			$spinner.remove();
		});

		// load color stuff
		$("#colorEmail").text(account.getAddress() + " (1)");

		var colorStart = account.getSetting("colorStart", "colorStart" + (account.id + 1));
		var colorEnd = account.getSetting("colorEnd", "colorEnd" + (account.id + 1));

		// defaults not set for these so put white to gray...
		if (!colorStart) {
			colorStart = "#fff";
			colorEnd = "#ccc";
		}

		// wrap this with initializingMiniColors = true so that miniColor events are not executed, because calling .miniColors executes the change event
		initializingMiniColors = true;
		$("#colorStart").val(colorStart);
		//$("#colorStart").miniColors('value', colorStart);

		$("#colorEnd").val(colorEnd);
		//$("#colorEnd").miniColors('value', colorEnd);
		initializingMiniColors = false;

		if (Settings.read("donationClicked") && account.getSetting("alias")) {
			$("#alias").val(account.getSetting("alias"));
		} else {
			$("#alias").val(account.getAddress());
		}
	}
}

function processEnabledSetting(node, settingName) {
	var $this = $(node);
	$this.toggleAttr("enabled");
	
	var enabled = $this.attr("enabled") != undefined;
	
	var account = getAccountByNode(node);
	account.saveSetting(settingName, enabled);

	setTimeout(function() {
		console.log("blur");
		$this.closest("paper-item").blur();
	}, 1);

	// if already loaded this account's labels then cancel bubbling to paper-item
	if ($("#monitorLabels").data("account").getAddress() == account.getAddress()) {
		return false;
	} else {
		return true;
	}
}

function getAccountByNode(node) {
	var email = $(node).closest("paper-item[email]").attr("email");
	return getAccountByEmail(email);
}

function loadAccountsOptions(loadAccountsParams) {
	console.log("loadAccountsOptions", loadAccountsParams);
	
	loadAccountsParams = initUndefinedObject(loadAccountsParams);
	
	var $monitorLabels = $("#monitorLabels");

	// only do this if accounts detected or oauth because or we leave the signInToYourAccount message in the dropdown
	if (bg.accounts.length || Settings.read("accountAddingMethod") == "oauth") {
		$monitorLabels.empty();
		$("#alias").val("");
	}
	
	var allAccounts = bg.accounts;
	if (Settings.read("accountAddingMethod") == "autoDetect") {
		allAccounts = allAccounts.concat(bg.ignoredAccounts);
	}
	
	if (allAccounts.length) {
		$("#accountsAndLabels .refresh").removeAttr("hidden");
		$("#syncSignInOrder").removeAttr("hidden");
	} else {
		$("#accountsAndLabels .refresh").attr("hidden", "");
		$("#syncSignInOrder").attr("hidden", "");
	}
	
	var accountsList = [];

	var selectedAccount;

	$.each(allAccounts, function(i, account) {
		if ((i==0 && !loadAccountsParams.selectedEmail) || (loadAccountsParams.selectedEmail && loadAccountsParams.selectedEmail == account.getAddress())) {
			selectedAccount = account;
		}
		
		var accountObj = {
			email:account.getAddress(),
			openLabel: account.getOpenLabel(),
			inboxByGmail: account.getSetting("openLinksToInboxByGmail"),
			conversationView: account.getSetting("conversationView"),
			ignore: account.getSetting("ignore")
		}
		
		accountsList.push(accountObj);
		
	});

	loadAccountsParams.account = selectedAccount;
	loadLabels(loadAccountsParams);

	var t = document.querySelector('#accountsBind');
	// could only set this .data once and could not use .push on it or it breaks the bind

	t.data = accountsList;
	
	setTimeout(function() {

		var lastError;
		var lastErrorCode;
		
		if (accountsList.length) {
			initMessages($("#accountsList *"));
			if (selectedAccount) {
				$("#accountsList")[0].select(selectedAccount.getAddress());
			} else {
				$("#accountsList")[0].select(accountsList.first().email);
			}
			$("#accountsList").find("paper-item[email]").each(function() {
				var account = getAccountByNode(this);
				if (account.error) {
					lastError = account.getError().niceError + " - " + account.getError().instructions;
					lastErrorCode = account.errorCode;
					$(this).find(".accountError").text( lastError );
				} else {
					$(this).find(".accountError").text( "" );
				}
			});
		}

		// patch because when paper-item was focused we couldn't get paper-tooltip to work inside the paper-item
		$("#accountsList").find("paper-item[email]").blur();
		
		if (Settings.read("accountAddingMethod") == "autoDetect" && lastError && lastErrorCode != JError.CANNOT_ENSURE_MAIN_AND_INBOX_UNREAD) {
			$("#accountErrorButtons").removeAttr("hidden");
		} else {
			$("#accountErrorButtons").attr("hidden", "");
		}
		
		if (lastError) {
			showError(lastError);
		}

	}, 1);
	
	$("body").toggleClass("disabledSound", !Settings.read("notificationSound"));
	$("body").toggleClass("disabledVoice", !Settings.read("notificationVoice"));
	$("body").toggleClass("disabledNotification", !Settings.read("desktopNotification"));
	$("body").toggleClass("browserButtonAction_gmailInbox", Settings.read("browserButtonAction") == BROWSER_BUTTON_ACTION_GMAIL_INBOX);
	
	console.log("accountslist event handlers")
	$("#accountsList")
		.off()
		.on("click", ".openLabel", function() {
			return false;
		})
		.on("click", ".openLabel paper-item", function(e) {
			var openLabel = $(this).attr("value");
			var account = getAccountByNode(this);
			account.saveSetting("openLabel", openLabel);
			return false;
		})
		.on("click", ".inboxByGmail", function() {
			if ($(this).attr("enabled") != undefined) {
				showMessage(getMessage("disabled"));
			} else {
				showMessage(getMessage("enabled"));
				
				openGenericDialog({
					content: getMessage("openLinksToInboxByGmailWarning"),
					otherLabel: getMessage("moreInfo")
				}).then(function(response) {
					if (response != "ok") {
						openUrl("https://jasonsavard.com/wiki/Inbox_by_Gmail?ref=GmailAccountOptions");
					}
				})
				
			}
			
			var retValue = processEnabledSetting(this, "openLinksToInboxByGmail");
			console.log("sel account", getAccountByNode(this));
			loadLabels({account:getAccountByNode(this)});
			return retValue;
		})
		.on("click", ".conversationView", function(e) {
			return processEnabledSetting(this, "conversationView");
		})
		.on("click", ".ignoreAccount", function(e) {
			var $this = $(this);
			var account = getAccountByNode(this);
			
			if (this.checked) {
				account.saveSetting("ignore", false).then(() => {
					$this.closest("paper-item").removeAttr("ignore");
					bg.pollAccounts({showNotification : true});
				}).catch(error => {
					showError(error);
				});
			} else {
				if (Settings.read("accountAddingMethod") == "autoDetect") {
					account.saveSetting("ignore", true);
					$this.closest("paper-item").attr("ignore", "");
					bg.pollAccounts({showNotification : true});
				} else {
					account.remove(bg.oAuthForEmails, bg.accounts);
					serializeOauthAccounts();
					pollAndLoad({showNotification:false});
				}
			}
		})
		.on("click", "paper-item[email]", function(e) {
			var $this = $(this);
			console.log("paper-item clicked", e);
			var account;
			allAccounts.some(function(thisAccount) {
				if (thisAccount.getAddress() == $("#accountsList")[0].selected) {
					account = thisAccount;
					return true;
				}
			});
	
			loadAccountsParams.account = account;
			loadLabels(loadAccountsParams);
			
			setTimeout(function() {
				$this.removeAttr("focused");
				$this.blur();
			}, 1)
		})
		.on("mousemove", function() {
			$("#accountsListToolTip").hide();
		});
	;
	
	$monitorLabels.off("change").on("change", ".monitoredLabelCheckbox", function() {
		
		var account = getSelectedAccount();
		
		var $monitorLabelLine = $(this).closest(".monitorLabelLine");
		var labelValue = $monitorLabelLine.data("labelValue");
		
		if (this.checked) {
			var $soundOptions = generateSoundOptions(account, labelValue);
			var $voiceOptions = generateVoiceOptions(account, labelValue);
			
			$monitorLabelLine.find(".soundOptionsWrapper").append($soundOptions);
			$monitorLabelLine.find(".voiceOptionsWrapper").append($voiceOptions);
		} else {
			$monitorLabelLine.find(".soundOptionsWrapper").empty();
			$monitorLabelLine.find(".voiceOptionsWrapper").empty();
		}
		
		$(this).closest(".monitorLabelLine").toggleClass("disabledLine", !this.checked);
		
		var values = getEnabledLabels();
		
		var inbox = values.indexOf(SYSTEM_INBOX) != -1;
		var important = values.indexOf(SYSTEM_IMPORTANT) != -1;
		var importantInInbox = values.indexOf(SYSTEM_IMPORTANT_IN_INBOX) != -1;
		var allMail = values.indexOf(SYSTEM_ALL_MAIL) != -1;
		var primary = values.indexOf(SYSTEM_PRIMARY) != -1;
		
		// warn if selecting more than more than one of the major labels
		var duplicateWarning = false;
		if ((inbox || allMail) && (important || importantInInbox || primary)) {
			duplicateWarning = true;
		} else if (important && importantInInbox) {
			duplicateWarning = true;
		}
		
		if (duplicateWarning) {
			openGenericDialog({
				title: "Duplicate warning",
				content: getMessage("duplicateLabelWarning")
			});
		} else if ((labelValue == SYSTEM_PRIMARY && this.checked) || (labelValue == SYSTEM_INBOX && !this.checked && primary)) {
			var gmailSettings = account.getSetting("gmailSettings");
			if (account.hasHiddenTabs()) {
				var $dialog = initTemplate("hiddenGmailTabsNoteDialogTemplate");
				openDialog($dialog).then(response => {
					if (response != "ok") {
						chrome.tabs.create({url: "https://jasonsavard.com/wiki/Gmail_tabs?ref=primaryLabelChecked"});
					}
				});
			}
		}

		if (values.length > 5) {
			openGenericDialog({
				title: "Too many labels",
				content: "I recommend monitoring less than 5 labels for faster polling and avoiding lockouts or consider using the <b>All mail</b> label instead!"
			});
		}
		
		if (allMail && values.length >= 2) {
			openGenericDialog({
				content: "If you select <b>All mail</b> then you should unselect the other labels or else you will get duplicates!"
			});
		}

		saveSetting("monitorLabel", getEnabledLabels()).then(() => {
			//if (Settings.read("accountAddingMethod") == "autoDetect") {
				bg.pollAccounts({showNotification:true, refresh:true}).then(() => {
					bg.accounts.forEach(account => {
						if (account.error) {
							showError(account.getError().niceError + " - " + account.getError().instructions);
						}
					});
				}).catch(error => {
					showError(error);
				});
			//} else {
				//account.monitoredLabelsChanged = true;
			//}
		}).catch(error => {
			showError(error);
		});
	});
}

function loadVoices() {
	console.log("loadVoices");
	if (chrome.tts) {
		chrome.tts.getVoices(function(voices) {
			
			var nativeFound = false;
			var options = [];
			
			for (var i=0; i<voices.length; i++) {
				if (voices[i].voiceName == "native") {
					nativeFound = true;
				} else {
					var optionsObj = {label:voices[i].voiceName, value:voices[i].voiceName};
					if (voices[i].extensionId) {
						optionsObj.value += "___" + voices[i].extensionId;
					}
					options.push(optionsObj);
				}
	      	}
			
			var t = document.querySelector('#t');
			// could only set this .data once and could not use .push on it or it breaks the bind
			
			if (t) {
				t.data = options;
			}
		});
	}
}

function playSound(soundName) {
	console.log("playsound: " + soundName);
	if (!soundName) {
		soundName = Settings.read("notificationSound");
	}
	$("#playNotificationSound").attr("icon", "av:stop");
	playing = true;
	bg.playNotificationSound(soundName).then(function() {
		playing = false;
		$("#playNotificationSound").attr("icon", "av:play-arrow");
	});
}

function playVoice() {
	$("#playVoice").attr("icon", "av:stop");
	
	bg.ChromeTTS.queue($("#voiceTestText").val()).then(() => {
		$("#playVoice").attr("icon", "av:play-arrow");
	}).catch(error => {
		$("#playVoice").attr("icon", "av:play-arrow");
		showError(error);
	});
}

function maybeShowWidgetMenu() {
	var $widgetTab =  $("paper-tab[value='widget']");
	if (!$widgetTab.is(":visible")) {
		chrome.runtime.sendMessage("llaficoajjainaijghjlofdfmbjpebpa", {action:"sayHello"}, function() {
			if (chrome.runtime.lastError) {
				// nothing
			} else {
				$widgetTab.removeAttr("hidden");
			}
		});
	}
}


function updateVoiceInputCountry() {
	for (var i = voiceInputDialect.options.length - 1; i >= 0; i--) {
		voiceInputDialect.remove(i);
	}
	var list = langs[voiceInputLanguage.selectedIndex];
	for (var i = 1; i < list.length; i++) {
		voiceInputDialect.options.add(new Option(list[i][1], list[i][0]));
	}
	voiceInputDialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

function initVoiceInputOptions() {
	if (Settings.read("voiceInput")) {
		$("#voiceInputOptions").show();
	} else {
		$("#voiceInputOptions").hide();
	}
}

function onVoiceInputLanguageChange() {
	Settings.store("voiceInputDialect", voiceInputDialect.value);
}

function resetCustomSounds() {
	var found = false;
	var emailSettings = Settings.read("emailSettings");
	
	if (emailSettings) {	
		try {
			for (email in emailSettings) {									
				for (label in emailSettings[email].sounds) {
					if (emailSettings[email].sounds[label].indexOf("custom_") != -1) {
						found = true;
						emailSettings[email].sounds[label] = Settings.read("notificationSound");
					}
				}
			}								
		} catch (e) {
			logError("error with hasCustomSounds: " + e);
		}
	}
	
	if (found) {
		Settings.store("emailSettings", emailSettings);
	}
	
	return found;
}

function openSoundDialog(params) {
	$("#notificationSoundInputButton")
		.data("params", params)
		.click()
	;
}

function updateCustomIcons() {
	
	function updateCustomIcon(iconFlagId) {
		var url = Settings.read(iconFlagId);
		if (url) {
			$("#" + iconFlagId)
				.attr("src", url)
				.width(19)
				.height(19)
			;
		}
	}

	updateCustomIcon("customButtonIconSignedOut");
	updateCustomIcon("customButtonIconNoUnread");
	updateCustomIcon("customButtonIconUnread");
	
	$("#currentBadgeIcon").attr("src", bg.buttonIcon.generateButtonIconPath());
}

function addCustomSound(params) {
	var title = params.title;
	
	var customSounds = Settings.read("customSounds");
	if (!customSounds) {
		customSounds = [];
	}

	var existingCustomSoundIndex = -1;
	$.each(customSounds, function(index, customSound) {
		if (customSound.name == title) {
			existingCustomSoundIndex = index;
		}
	});

	if (params.overwrite && existingCustomSoundIndex != -1) {
		customSounds[existingCustomSoundIndex] = {name:title, data:params.data};
	} else {
		// look for same filenames if so change the name to make it unique
		if (existingCustomSoundIndex != -1) {
			title += "_" + String(Math.floor(Math.random() * 1000));
		}
		customSounds.push({name:title, data:params.data});
	}

	Settings.store("customSounds", customSounds).then(() => {
		playSound("custom_" + title);
		if (params.account) {
			// label specific
			return params.account.saveSettingForLabel("sounds", params.labelValue, "custom_" + title).then(() => {
				$(".monitorLabelLine").each(function() {
					var labelValue = $(this).data("labelValue");
					
					var soundDropdown = generateSoundOptions(params.account, labelValue);
					$(this).find(".soundOptionsWrapper paper-dropdown-menu").replaceWith( soundDropdown );
				});
				
			});
		} else {
			// default
			return Settings.store("notificationSound", "custom_" + title).then(() => {
				var soundDropdown = generateSoundOptions();
				params.$paperMenu.closest("paper-dropdown-menu").replaceWith( soundDropdown );
			});
		}
	}).catch(error => {
		var error = "Error saving file: " + error + " Try a smaller file or another one or click the 'Not working' link.";
		niceAlert(error);
		logError(error);
	});
}

$(document).ready(function() {
	
	polymerPromise.then(function() {
	
		bg.settingsPromise.then(() => {
			if (Settings.read("settingsAccess") == "locked") {
				if (justInstalled) {
					// might not be necessary because in onInstalled i also avoid opening this options page if locked (but keeping this here in case of a race condition)
					window.close();
				} else {
					niceAlert("The options have been disabled by your network adminstrator!");
				}
			} else if (Settings.read("settingsAccess") == "userCanModifyOnlyMonitoredLabels") {
				niceAlert("Many options have been disabled by your network administrator!")
			}
		}).catch(error => {
			showError(error);
		});
		
		$("#mainTabs paper-tab").click(function(e) {
			var tabName = $(this).attr("value");
			showOptionsSection(tabName);
			// timeout required because the pushstate created chopiness
			setTimeout(function() {
				history.pushState({}, "blah", "#" + tabName);
			}, 500)
		});
		
		var $soundOptions = generateSoundOptions();
		$(".defaultSoundOptionWrapper").append($soundOptions);
	
		var $voiceOptions = generateVoiceOptions();
		$(".defaultVoiceOptionWrapper").append($voiceOptions);
	
		if (justInstalled) {
			showOptionsSection("welcome");
			
			var newUrl = setUrlParam(location.href, "action", null);
			history.replaceState({}, 'Install complete', newUrl);
					
			if (DetectClient.isOpera()) {
				if (!window.Notification) {
					niceAlert("Desktop notifications are not yet supported in this browser!");				
				}
				if (window.chrome && !window.chrome.tts) {
					niceAlert("Voice notifications are not yet supported in this browser!");				
				}
				niceAlert("You are not using the stable channel of Chrome! <a target='_blank' style='color:blue' href='https://jasonsavard.com/wiki/Unstable_channel_of_Chrome'>More info</a><br><br>Bugs might occur, you can use this extension, however, for obvious reasons, these bugs and reviews will be ignored unless you can replicate them on stable channel of Chrome.");
			}
			
			// check for sync data
			bg.syncOptions.fetch().then(function(items) {
				console.log("fetch response", items);
				openGenericDialog({
					title: "Restore settings",
					content: "Would you like to use your previous extension options? <div style='margin-top:4px;font-size:12px;color:gray'>(If you had previous issues you should do this later)</div>",
					showCancel: true
				}).then(function(response) {
					if (response == "ok") {
						bg.syncOptions.load(items).then(function(items) {
							
							// see if user had any custom sounds...
							var hasCustomSoundsWarning = "";
							var hasCustomSounds = resetCustomSounds();
							if (hasCustomSounds) {
								hasCustomSoundsWarning = "<div style='margin-top:7px;font-style:italic'>Note: You will to have manually re-upload your custom sounds because they were to big to sync!</div>";
							}
							
							openGenericDialog({
								title: "Options restored!",
								okLabel: "Restart extension"
							}).then(response => {
								reloadExtension();
							});
						});
					}
				});
			}).catch(error => {
				console.warn("error fetching: ", error);
			});
	
		} else {
			initSelectedTab();
		}
		
		window.onpopstate = function(event) {
			console.log(event);
			initSelectedTab();
		}
		
		$("#deleteAllCustomSounds").click(function() {
			Settings.delete("customSounds");
			location.reload();
		});
		
		$(".closePopup").click(function() {
			$(this).closest(".popup").fadeOut();
		});
	
		setTimeout(function() {
			if (location.href.match("highlight=DND_schedule")) {
				$("#DND_scheduleWrapper").addClass("highlight");
			} else if (location.href.match("highlight=quickContact")) {
				$("#quickComposeWrapper").addClass("highlight");
				setTimeout(function() {
					$("#quickComposeEmail").focus();
				}, 200);
			}
		}, 500);
		
		// patch: must modify the template and then import the template so that polymer dropdown responds
		// must load this before initPrefs to initial default times
		$(".DND_scheduleTemplate").each(function(index) {
			var $template = $(this);
			// template will only exist the first time because i overwrite it with the dom once initiated
			if ($template.length) {
				var template = $template[0];
				
				/*
				var dropdown;
				dropdown = template.content.querySelectorAll(".weekdayDropDown");
				if ($(dropdown).length) {
					$(dropdown).first()[0].setAttribute("label", dateFormat.i18n.dayNamesShort[1] + "-" + dateFormat.i18n.dayNamesShort[5]);
				}
				*/
				
				/*
				if ($(dropdown).find(".DND_scheduleStartHour").length) {
					if (dropdown) {
						dropdown.setAttribute("label", dateFormat.i18n.dayNamesShort[1] + "-" + dateFormat.i18n.dayNamesShort[5]);
					} else {
						dropdown = template.content.querySelector(".weekendDropDown");
						if (dropdown) {
							dropdown.setAttribute("label", dateFormat.i18n.dayNamesShort[6] + "-" + dateFormat.i18n.dayNamesShort[0]);
						}
					}
				}
				*/
				
				var paperMenuDiv = template.content.querySelector("paper-menu");

			    var dndDate = today();
			    dndDate.setHours(1);
			    for (var a=1; a<=24; a++) {
			    	dndDate.setHours(a);
			    	
					var paperItem = document.createElement("paper-item");
					var textNode = document.createTextNode(dndDate.format("h tt"));
					paperItem.appendChild(textNode);
					paperItem.setAttribute("value", a);
					
					paperMenuDiv.appendChild(paperItem);
			    }

				var newNode = document.importNode(template.content, true);
				$template.replaceWith(newNode);
			}
		});
		
		$(".weekdayDropDown").first().attr("label", dateFormat.i18n.dayNamesShort[1] + "-" + dateFormat.i18n.dayNamesShort[5]);
		$(".weekendDropDown").first().attr("label", dateFormat.i18n.dayNamesShort[6] + "-" + dateFormat.i18n.dayNamesShort[0]);
		
		$("#DND_schedule").change(function() {
	    	setTimeout(function() {
	    		updateBadge();
	    	}, 200);
		});
		
		$("#DND_scheduleWrapper paper-item").click(function() {
			$("#DND_schedule")[0].checked = true;
			$("#DND_schedule").trigger("change");
	    	setTimeout(function() {
	    		updateBadge();
	    	}, 200);
		});
		
		if (!('webkitSpeechRecognition' in window)) {
			$("#voiceInput").attr("disabled", true);
			$("#upgradeBrowser").show();
		}
		
		$("#voiceInput").click(function() {
			if (this.checked) {
				chrome.tabs.query({url:"https://mail.google.com/*"}, function(tabs) {
					$.each(tabs, function(index, tab) {
						insertSpeechRecognition(tab.id);
					});
				});
			} else {
				// wait for pref to be saved then reload tabs
				setTimeout(function() {
					chrome.tabs.query({url:"https://mail.google.com/*"}, function(tabs) {
						$.each(tabs, function(index, tab) {
							chrome.tabs.reload(tab.id);
						});
					});
				}, 500);
			}
		});
		
		$(window).focus(function(event) {
			console.log("window.focus");
			// reload voices
			loadVoices();
		});
		
		loadVoices();
		// seems we have to call chrome.tts.getVoices twice at a certain 
		if (DetectClient.isLinux()) {
			setTimeout(function() {
				loadVoices();
			}, seconds(1));
		}
		
		if (Settings.read("notificationVoice")) {
			$("#voiceOptions").show();
		} else {
			$("#voiceOptions").hide();
		}
		
		$("#notificationVoice").on("click", "paper-item", function() {
			var voiceName = $("#voiceMenu")[0].selected;
			//var voiceName = $(this).val(); // commented because .val would not work for non-dynamically values like addVoice etc.
			
			if (voiceName) {
				if (voiceName == "addVoice") {
					openUrl("https://jasonsavard.com/wiki/Voice_Notifications");
				} else {
					
					if (voiceName.indexOf("Multilingual TTS Engine") != -1) {
						$("#pitch, #rate").attr("disabled", "true");
					} else {
						$("#pitch, #rate").removeAttr("disabled");
					}
					
					playVoice();
				}
				$("#voiceOptions").fadeIn();
			} else {
				$("#voiceOptions").hide();
			}
		});
		
		$("#playVoice").click(function() {
			if (bg.ChromeTTS.isSpeaking()) {
				bg.ChromeTTS.stop();
				$("#playVoice").attr("icon", "av:stop");
			} else {
				playVoice();
			}
		});
		
		$("#voiceOptions paper-slider").on("change", function() {
			setTimeout(function() {
				playVoice();
			}, 100);
		});
		
		$("#hide_count, #showButtonTooltip").change(function() {
			bg.updateBadge(bg.unreadCount);
		});
		
		$("#badgeIcon paper-icon-item").click(function() {
			if ($(this).attr("value") == "custom") {
				if (false && (Settings.read("customButtonIconSignedOut") || Settings.read("customButtonIconNoUnread") || Settings.read("customButtonIconUnread"))) {
					bg.buttonIcon.setIcon({force:true});
					bg.updateBadge(bg.unreadCount);
				} else {
					bg.buttonIcon.setIcon({force:true});
					bg.updateBadge(bg.unreadCount);
					
					$(this).closest("paper-dropdown-menu")[0].close();
					
					var $dialog = initTemplate("customButtonDialogTemplate");
					
					$dialog.find("#chooseSignedOutIcon").off().on("click", function() {
						$("#signedOutButtonIconInput").trigger("click");
						return false;
					});
				
					$dialog.find("#chooseNoUnreadEmail").off().on("click", function() {
						$("#noUnreadButtonIconInput").trigger("click");
						return false;
					});
					
					$dialog.find("#chooseUnreadEmail").off().on("click", function() {
						$("#unreadButtonIconInput").trigger("click");
						return false;
					});
					
					$dialog.find("#signedOutButtonIconInput, #noUnreadButtonIconInput, #unreadButtonIconInput").off().on("change", function(e) {
						var buttonId = $(this).attr("id");
						console.log(this.files);
				
						var file = this.files[0];
						
						var fileReader = new FileReader();
				
						fileReader.onload = function() {
							
							//var soundFilename = file.name.split(".")[0];
							
							console.log("result: ", this.result);
							
							var canvas = document.createElement("canvas");
							var img = new Image();
							img.onload = function() {
								var widthHeightToSave;
								if (this.width <= 19) {
									widthHeightToSave = 19;
								} else {
									widthHeightToSave = 38;
								}
								canvas.width = canvas.height = widthHeightToSave;
								
								var context2 = canvas.getContext("2d");
								context2.drawImage(this, 0, 0, widthHeightToSave, widthHeightToSave);
				
								console.log("dataurl: " + canvas.toDataURL().length);
								
								function storeIcon(all) {
									if (all || buttonId == "signedOutButtonIconInput") {
										Settings.store("customButtonIconSignedOut", canvas.toDataURL());
									}
									if (all || buttonId == "noUnreadButtonIconInput") {
										Settings.store("customButtonIconNoUnread", canvas.toDataURL());
									}
									if (all || buttonId == "unreadButtonIconInput") {
										Settings.store("customButtonIconUnread", canvas.toDataURL());
									}
				
									$("input[name='icon_set'][value='custom']").click();
									updateCustomIcons();
									bg.buttonIcon.setIcon({force:true});
								}
							  
								if (Settings.read("customButtonIconSignedOut") || Settings.read("customButtonIconNoUnread") || Settings.read("customButtonIconUnread")) {
									storeIcon();
									showMessage(getMessage("done"));
								} else {
									openGenericDialog({
										content: "Use this icon for all email states?",
										okLabel: "Yes to all",
										cancelLabel: "Only this one"
									}).then(response => {
										if (response == "ok") {
											storeIcon(true);
										} else {
											storeIcon();
										}
										niceAlert(getMessage("done"));
									});
								}
								
							}
							
							img.onerror = function(e) {
								console.error(e);
								niceAlert("Error loading image, try another image!");
							}
							
							img.src = this.result;
							//img.src = "chrome://favicon/size/largest/https://inbox.google.com";
							//img.src = "https://ssl.gstatic.com/bt/C3341AA7A1A076756462EE2E5CD71C11/ic_product_inbox_16dp_r2_2x.png";
							
						}
				
						fileReader.onabort = fileReader.onerror = function(e) {
							console.error("fileerror: ", e);
							if (e.currentTarget.error.name == "NotFoundError") {
								alert("Temporary error, please try again.");
							} else {
								alert(e.currentTarget.error.message + " Try again.");
							}
						}
				
						fileReader.readAsDataURL(file);
						
					});
					
					openDialog($dialog).then(function(response) {
						if (response != "ok") {
							openUrl("https://jasonsavard.com/wiki/Button_icon#Add_your_own_custom_icons");
						}
					});
				}
			} else {
				bg.buttonIcon.setIcon({force:true});
			}
			$("#currentBadgeIcon").attr("src", bg.buttonIcon.generateButtonIconPath());
		});
		
		$("#runInBackground").click(function() {
			var that = this;
			// timeout to let permissions logic determine check or uncheck the before
			setTimeout(function() {
				if (that.checked) {
					openDialog("runInBackgroundDialogTemplate");
				}
			}, 1);
		});
		
		chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
			if (message.command == "grantPermissionToEmails") {
				userResponsedToPermissionWindow = true;
				showLoading();
				if (message.error) {
					// do nothing error should have been reported in background
					hideLoading();
				} else {
					// only add it doesn't already exist
					var account = getAccountByEmail(message.result.tokenResponse.userEmail);
					if (!account) {
						console.log("new account");
						// used bg. because localStorage was null inside callback of getChromeWindowOrBackgroundMode
						account = new bg.MailAccount({mailAddress:message.result.tokenResponse.userEmail});
						resetSettings([account]);
						bg.accounts.push(account);
					}
					
					account.getEmails().then(function() {
						loadAccountsOptions({selectedEmail:account.getAddress()});
						hideLoading();
						account.syncSignInId().then(() => {
							// do nothing because we use the next .then below
						}).catch(errorResponse => {
							niceAlert("Could not determine the sign in order, so assuming " + bg.accounts.length);
							account.setAccountId(bg.accounts.length-1);
						}).then(() => {
							serializeOauthAccounts();
							bg.mailUpdate();
						});
					}).catch(function(error) {
						hideLoading();
						showError(error);
					});
				}
			}
		});

		if (navigator.language.indexOf("en") == -1) {
			$("#lang").find("[value='en-GB']").remove();
		}
		
		var navLang = Settings.read("language");
		if ($("#lang").find("[value='" + navLang + "']").exists()) {
			$("#lang")[0].selected = navLang;
		} else if ($("#lang").find("[value='" + navLang.substring(0, 2) + "']").exists()) {
			$("#lang")[0].selected = navLang.substring(0, 2);
		} else {
			$("#lang").val("en");
		}
	
		$("#lang paper-item").click(function() {
			var langValue = $("#lang")[0].selected;
			loadLocaleMessages(langValue).then(() => {
				initMessages();
				Settings.delete("tabletViewUrl");
			}).catch(error => {
				showError(error);
			});
		});
		
		$("#pollingInterval paper-item").click(function() {
			bg.restartCheckEmailTimer();
		});
		
		$("#signIn").click(function() {
			openUrl(Urls.SignOut);
		});
		
		$(".refresh").click(function() {
			pollAndLoad({showNotification:true, refresh:true});
			return false;
		});
		
		$("#signInNotWorking").click(function() {
			openUrl("https://jasonsavard.com/wiki/Auto-detect_sign_in_issues");
		});
		
		function initOnlyWithCheckerPlusPopupWarning(params) {
			if (Settings.read("browserButtonAction") == BROWSER_BUTTON_ACTION_CHECKER_PLUS || Settings.read("browserButtonAction") == BROWSER_BUTTON_ACTION_CHECKER_PLUS_POPOUT) {
				$("#checkerPlusButtons").show();
				$("#emailPreview").show();
				$("#alwaysDisplayExternalContentWrapper").show();
			} else {
				$("#checkerPlusButtons").hide();
				$("#emailPreview").hide();
				$("#alwaysDisplayExternalContentWrapper").hide();
			}
		}
		
		function initPopupWindowOptions(value) {
			if (!value) {
				value = Settings.read("browserButtonAction");
			}
			
			if (value == BROWSER_BUTTON_ACTION_CHECKER_PLUS || value == BROWSER_BUTTON_ACTION_CHECKER_PLUS_POPOUT) {
				$("#popupWindowOptionsForComposeReply").show();
				$("#checkerPlusBrowserButtonActionIfNoEmail").show();
				$("#gmailPopupBrowserButtonActionIfNoEmail").hide();
				$("#clickingCheckerPlusLogo").show();
				initOnlyWithCheckerPlusPopupWarning({remove:true})
			} else if (value == BROWSER_BUTTON_ACTION_GMAIL_TAB || value == BROWSER_BUTTON_ACTION_GMAIL_IN_NEW_TAB || value == BROWSER_BUTTON_ACTION_COMPOSE) {
				$("#checkerPlusBrowserButtonActionIfNoEmail").hide();
				$("#gmailPopupBrowserButtonActionIfNoEmail").hide();
				$("#popupWindowOptionsForComposeReply").show();
				$("#clickingCheckerPlusLogo").hide();
				initOnlyWithCheckerPlusPopupWarning({add:true})
			} else {
				$("#popupWindowOptionsForComposeReply").hide();
				$("#checkerPlusBrowserButtonActionIfNoEmail").hide();
				$("#gmailPopupBrowserButtonActionIfNoEmail").show();
				$("#clickingCheckerPlusLogo").show();
				initOnlyWithCheckerPlusPopupWarning({add:true})
			}
		}
		
		initPopupWindowOptions();
		
		$("#browserButtonAction paper-item").click(function() {
			initPopupWindowOptions($(this).attr("value"));
			setTimeout(function() {
				initPopup(bg.unreadCount);
			}, 500);
		});
		
		$(".browserButtonActionIfNoEmail paper-item").click(function() {
			setTimeout(function() {
				initPopup(bg.unreadCount);
			}, 500);
		});
		
		$("#materialDesign").change(function() {
			showMessage("Only the Material Design is supported!");
			setTimeout(function() {
				initPopup(bg.unreadCount);
			}, 500);
		});
		
		function initSetPositionAndSizeOptions() {
			if (Settings.read("setPositionAndSize")) {
				$("#setPositionAndSizeOptions").show();
				$("#testOutPopupWindow").show();
			} else {
				$("#setPositionAndSizeOptions").hide();
				$("#testOutPopupWindow").hide();
			}
		}
		
		initSetPositionAndSizeOptions();
		$("#setPositionAndSize").change(function() {
			setTimeout(function() {
				initSetPositionAndSizeOptions();
			}, 100)
		});
		
		$("input[name='buttons']").change(function() {
			initButtons();
		});
	
	
		if (Settings.read("donationClicked")) {
			$("[mustDonate]").each(function(i, element) {
				$(this).removeAttr("mustDonate");
			});
		}
		
	    $("#logo").dblclick(function() {
	    	if (Settings.read("donationClicked")) {
	    		Settings.delete("donationClicked");
	    	} else {
	    		Settings.store("donationClicked", true)
	    	}
	    	location.reload(true);
	    });
	    
		setColors();
	    
	    $("#useColors").change(function() {
	    	if (Settings.read("donationClicked")) {
				saveSetting("useColors", $("#useColors")[0].checked);
	    	}
	    });
	    
	    
		chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
			if (message.command == "featuresProcessed") {
				location.reload();
			}
		});
		
		var notificationSound = Settings.read("notificationSound");
		if (notificationSound) {
			$("#soundOptions").show();
		} else {
			$("#soundOptions").hide();
		}
		
		$("#playNotificationSound").click(function() {
			if (playing) {
				stopNotificationSound();
				playing = false;
				$(this).attr("icon", "av:play-arrow");
			} else {
				playSound();
			}
		});
		
		$("#notificationSoundVolume").on("change", function() {
			setTimeout(function() {
				playSound();
			}, 100);
		});
		
		$("#notificationSoundInputButton").change(function() {
			console.log("notificationSoundInputButton", arguments);
			var params = $(this).data("params");
			var file = this.files[0];
			var fileReader = new FileReader();
	
			fileReader.onloadend = function () {
				
				var customSounds = Settings.read("customSounds");
				if (!customSounds) {
					customSounds = [];
				}
				
				var soundFilename = file.name.split(".")[0];
				
				params.title = soundFilename;
				params.data = this.result;
				addCustomSound(params);
			}
	
			fileReader.onabort = fileReader.onerror = function(e) {
				niceAlert("Problem loading file");
			}
	
			console.log("file", file)
			fileReader.readAsDataURL(file);	
		});
		
		$("#soundBrowse").change(function() {
			saveSoundFile(this.files);
		});
		
		$("#testOutPopupWindow").click(function() {
			openTabOrPopup({url:"https://mail.google.com?view=cm&fs=1&tf=1", name:"test", testingOnly:true});
		});
	
		maybeShowWidgetMenu();
		setInterval(function() {
			maybeShowWidgetMenu();
		}, 2000)

		$("#widgetWidth paper-item, #widgetHeight paper-item").click(function() {
			setTimeout(function() {
				sendFVDInfo();
			}, 200);
		});

		// prevent jumping due to anchor # and because we can't javascript:; or else content security errors appear
		$("a[href='#']").on("click", function(e) {
			//e.stopPropagation()
			//e.stopImmediatePropagation();
			// use preventDefault instead of return false because preventDefault will "cancel any default action that the browser may have for THIS event" and does not stop the analytics sendGA code from running after
			e.preventDefault()
			//return false;
		});
		
		if (Settings.read("ignoreEmails")) {
			$("#ignoreTheseAccountsWrapper").show();
		}
		
		function initNotifications(startup) {
			var showMethod;
			var hideMethod;
			if (startup) {
				showMethod = "show";
				hideMethod = "hide";
			} else {
				showMethod = "slideDown";
				hideMethod = "slideUp";
			}
			
			var desktopNotification = Settings.read("desktopNotification");
			if (desktopNotification == "") {
				$("#desktopNotificationOptions")[hideMethod]();
			} else if (desktopNotification == "text") {
				$("#desktopNotificationOptions")[showMethod]();
				$("#textNotificationOptions")[showMethod]();
				$("#richNotificationOptions")[hideMethod]();
			} else if (desktopNotification == "rich") {
				$("#desktopNotificationOptions")[showMethod]();
				$("#textNotificationOptions")[hideMethod]();
				$("#richNotificationOptions")[showMethod]();
			}
		}
		
		initNotifications(true);
		
		$("#desktopNotification paper-item").click(function() {
			initNotifications();
		});
		
		$("#testNotification").click(function(e) {
			if (Settings.read("desktopNotification") == "text") {
				Notification.requestPermission(function(permission) {
					if (permission == "granted") {
						showNotificationTest({testType:"text", requirementText:getMessage("notificationTryItOutInstructions")});
					} else {
						niceAlert("Permission denied! Refer to <a style='color:blue' href='https://support.google.com/chrome/answer/3220216'>Chrome notifications</a> to enable them." + " (permission: " + permission + ")");
					}
				});
			} else if (Settings.read("desktopNotification") == "rich") {
				showLoading();
				showNotificationTest({testType:"rich", requirementText:getMessage("notificationTryItOutInstructions"), showAll:e.ctrlKey}, function() {
					hideLoading();
				});
			}
		});
		
		$("#showNotificationDuration_text paper-item").click(function() {
			var value = $(this).attr("value");
			$("#showNotificationDuration_rich")[0].setAttribute("selected", value);
		});

		$("#showNotificationDuration_rich paper-item").click(function() {
			var value = $(this).attr("value");
			$("#showNotificationDuration_text")[0].setAttribute("selected", value);
		});
		
		$("#playVideosInsideGmail").change(function() {
			if (this.checked) {
				openGenericDialog({
					content: "You will have to refresh any currently opened Gmail pages."
				});
			}
		});

		$("#alias")
			.blur(function() {
				saveSetting("alias", getAlias());
			})
			.keydown(function(e) {
				if (e.keyCode == 13) {
					saveSetting("alias", getAlias());
					return false;
				}
			})
		;
		
		function reinitContextMenu() {
			console.log("reinitContextMenu");
			clearTimeout(window.initQuickContactContextMenuTimeout);
			window.initQuickContactContextMenuTimeout = setTimeout(function() {
				// Must be called from bg or i was loosing menu items would not respond??
				bg.initQuickContactContextMenu({update:true});
			}, 200);
	
		}
		
		$("#showContextMenuItem").change(function() {
			reinitContextMenu();
		});
		
		$("#quickComposeEmail, #quickComposeEmailAlias").on("blur keydown", function() {
			reinitContextMenu();
		});
		
		
		initVoiceInputOptions();
		
		$("#voiceInput").change(function() {
			setTimeout(function() {
				initVoiceInputOptions();
			}, 1);
		});
		
		// init languages
		if (window.voiceInputLanguage) {
			var voiceInputDialectPref = Settings.read("voiceInputDialect", navigator.language);
			var voiceInputLanguageIndex;
			var voiceInputDialectIndex;
			for (var i = 0; i < langs.length; i++) {
				voiceInputLanguage.options[i] = new Option(langs[i][0], i);
				//console.log("lang: " + langs[i][0]);
				for (var a=1; a<langs[i].length; a++) {
					//console.log("dial: " + langs[i][a][0]);
					if (langs[i][a][0] == voiceInputDialectPref) {
						voiceInputLanguageIndex = i; 
						voiceInputDialectIndex = a-1;
						break;
					}
				}
			}	
			
			voiceInputLanguage.selectedIndex = voiceInputLanguageIndex;
			updateVoiceInputCountry();
			voiceInputDialect.selectedIndex = voiceInputDialectIndex;
			
			$("#voiceInputLanguage").change(function() {
				updateVoiceInputCountry();
				if (voiceInputLanguage.options[voiceInputLanguage.selectedIndex].text == "English") {
					voiceInputDialect.selectedIndex = 6;
				}
				onVoiceInputLanguageChange();
			});
			
			$("#voiceInputDialect").change(function() {
				onVoiceInputLanguageChange();
			});
		}
		
		$("#saveSyncOptions").click(function() {
			bg.syncOptions.save("manually saved").then(function() {
				openGenericDialog({
					title: "Done",
					content: "Make sure you are signed into Chrome for the sync to complete",
					cancelLabel: getMessage("moreInfo")
				}).then(response => {
					if (response == "cancel") {
						openUrl("https://support.google.com/chrome/answer/185277");
					}
				});
			}).catch(function(error) {
				showError("Error: " + error);
			});
			return false;
		});
	
		$("#loadSyncOptions").click(function() {
			bg.syncOptions.fetch(function(response) {
				// do nothing last fetch will 
				console.log("syncoptions fetch response", response);
			}).catch(function(response) {
				console.log("catch reponse", response);
				// probably different versions
				if (response && response.items) {
					return new Promise(function(resolve, reject) {
						openGenericDialog({
							title: "Problem",
							content: response.error + "<br><br>" + "You can force it but it <b>might create issues</b> in the extension and the only solution will be to re-install without loading settings!",
							okLabel: "Force it",
							showCancel: true
						}).then(function(dialogResponse) {
							if (dialogResponse == "ok") {
								resolve(response.items);
							} else {
								reject("cancelledByUser");
							}
						});
					});
				} else {
					throw response;
				}
			}).then(function(items) {
				console.log("syncoptions then");
				return bg.syncOptions.load(items);
			}).then(function() {
				niceAlert("Click OK to restart the extension").then(() => {
					reloadExtension();
				});
			}).catch(function(error) {
				console.log("syncoptions error: " + error);
				if (error != "cancelledByUser") {
					openGenericDialog({
						content: "error loading options: " + error
					});
				}
			});
			
			return false;
		});
	
		$("#exportLocalStorage").click(function() {
			downloadObject(localStorage, "localStorage.json");
		})
		$("#importLocalStorage").click(function() {
			var localStorageText = $("#jsonString").val();
			if (localStorageText) {
				var localStorageImportObj = JSON.parse(localStorageText);
				localStorage.clear();
				for (item in localStorageImportObj) {
					localStorage.setItem(item, localStorageImportObj[item]);
				}
				niceAlert("Done. Reload the extension to use these new settings!");
			} else {
				niceAlert("Must enter JSON string!")
			}
		})
		
		$("#importIndexedDB").click(function() {
			var jsonString = $("#jsonString").val();
			if (jsonString) {
				var jsonObject = JSON.parse(jsonString);
				
				bg.syncOptions.importIndexedDB(jsonObject).then(function() {
					niceAlert("Done. Reload the extension to use these new settings!");
				}).catch(function(error) {
					niceAlert(error);
				});
				
			} else {
				niceAlert("Must enter JSON string!")
			}			
		});
		
		$("#exportIndexedDB").click(function() {
			bg.syncOptions.exportIndexedDB({exportAll:true}, function(response) {
				if (response.error) {
					niceAlert(response.error);
				} else {
					downloadObject(response.data, "indexedDB.json");
				}
			});
		})
		
		function initDisplayForAccountAddingMethod() {
			if (Settings.read("accountAddingMethod") == "autoDetect") {
				$("body").addClass("autoDetect");
				$("body").removeClass("oauth");
			} else {
				$("body").removeClass("autoDetect");
				$("body").addClass("oauth");
			}
		}
		
		initDisplayForAccountAddingMethod();
		
		$("#accountAddingMethod paper-radio-button").click(function() {
			initDisplayForAccountAddingMethod();
			
			resetSettings(bg.accounts);
			pollAndLoad({showNotification:false, refresh:true});
		});
		
		$("#autoCollapseConversations").change(function() {
			if (!this.checked) {
				niceAlert("Done. But, but not recommended because it will slow the loading of message.");
			}
		});
		
		$("#showNotificationEmailImagePreview").change(function() {
			var checkbox = this;
			if (checkbox.checked && Settings.read("accountAddingMethod") == "autoDetect") {
				chrome.permissions.request(Origins.IMAGE_PREVIEW, function(granted) {
					if (granted) {
						// do nothing
						return true;
					} else {
						checkbox.checked = false;
						Settings.store("showNotificationEmailImagePreview", false);
						openGenericDialog({
							title: "Denied",
							content: "Click the extra permissions link on the right for more info on these permissions" 
						});
						return false;
					}
				});
			}
		});
		
		$("#addAccount").click(function() {
			openPermissionWindow(bg.oAuthForEmails);
		});
	
		$("#starringAppliesInboxLabel").change(function(e) {
			var that = this;
			if (Settings.read("accountAddingMethod") == "autoDetect") {
				openGenericDialog({
					content: "Only available with enabing adding accounts method in Accounts tab"
				});
				
				// reset it now
				setTimeout(function() {
					that.checked = false;
					Settings.delete("starringAppliesInboxLabel");
				}, 200);
			}
		});
		
		$("#syncSignInOrder").click(function() {
			var promises = [];
			
			bg.accounts.forEach(function(account) {
				var promise = account.syncSignInId();
				promises.push(promise);
			});
			
			showLoading();
			Promise.all(promises).then(function(promiseAllResponse) {
				hideLoading();
				serializeOauthAccounts();
				showMessage(getMessage("done"));
			}).catch(function(errorResponse) {
				hideLoading();
				niceAlert("Try signing out and into your Gmail accounts and then do this sync again.\n\n" + errorResponse);
			});
		});
		
		$("#maxUnauthorizedAccount paper-item").click(function() {
			setTimeout(function() {
				pollAndLoad({showNotification:true});
			}, 200);
		});
		
		$("#useBasicHTMLView").change(function() {
			if (this.checked) {
				openGenericDialog({
					title: getMessage("useBasicHTMLView"),
					content: "This is generally only used for people with slow internet connections!",
					cancelLabel: getMessage("testIt"),
					noAutoFocus: true
				}).then(function(response) {
					if (response == "cancel") {
						var account = getFirstActiveAccount(bg.accounts);
						openUrl(account.getMailUrl({useBasicGmailUrl:true}));
					}
				});
			}
		});
		
		$("#console_messages").change(function() {
			openGenericDialog({content:this.checked ? "logging enabled" : "logging disabled", okLabel:"Restart Extension", showCancel:true}).then(response => {
				if (response == "ok") {
					reloadExtension();
				}
			});
		});
		
		updateCustomIcons();
		
		$("#testButtonIconAnimation").click(function() {
			showMessage("Don't look here, look at the top right :)")
			setTimeout(function() {
				bg.buttonIcon.startAnimation({testAnimation:true});
			}, 1000);
		});
	
		function gmailtest(account) {
			showLoading();
			
			var firstResponse = "no response yet...";
			account.testGmailAT().then(function(response) {
				firstResponse = response;
			}).catch(function(response) {
				firstResponse = "catch: " + JSON.stringify(response);
			});
			
			setTimeout(function(){
				$.ajax(account.getMailUrl()).done(function(data) {
					hideLoading();
					var tmp = /GM_ACTION_TOKEN\=\"([^\"]*)\"/.exec(data);
					if (tmp && tmp.length) {
						if (firstResponse == tmp[1]) {
							niceAlert("same gmail at:<br><br>" + firstResponse);
						} else {
							niceAlert("FR: " + firstResponse + "<br><br>gmail at: " + tmp[1]);
						}
					} else {
						niceAlert("FR2: " + firstResponse + "\n\nno action token found in response");
					}
				}).fail(function(error) {
					hideLoading();
					niceAlert("error: " + error);
				});
			}, 3000)
		}
		
		function gmailtestmarkasread(account, force) {
			showLoading();
			
			bg.pollAccounts().then(function() {
				
				bg.mailUpdate();
				
				var firstMail = account.getMail().first();
				if (firstMail) {
					
					account.testGmailAT(force).then(function(gmailAT) {
					   var postURL = account.getMailUrl({useBasicGmailUrl:true}).replace("http:", "https:");
					   postURL += Math.ceil(1000000 * Math.random()) + "/";
					   var postParams = "t=" + firstMail.id + "&at=" + gmailAT + "&" + "act=rd";
		
					   var postXHR = new XMLHttpRequest();
					   postXHR.onreadystatechange = function () {
						   hideLoading();
						   $("body").append("in postaction: " + postURL + ": " + this.readyState + " __ " + this.status + "<br>");
						   if (this.readyState == 4 && this.status == 200) {
							   if (this.responseText.indexOf("role=\"alert\"") != -1) {
								   $("body").append("success<br>");
							   } else {
								   $("body").append("failure<br>");
							   }
							   $("body").append(this.responseText);
						   } else if (this.readyState == 4 && this.status == 401) {
							   $("body").append("unauthorized<br>");
						   }
						   
						   bg.pollAccounts().then(function() {
							   bg.mailUpdate();
						   });
	
					   }
					   postXHR.onerror = function (error) {
						   hideLoading();
						   $("body").append("error: " + error + "<br>");
					   }
		
					   postXHR.open("POST", postURL, true);
					   postXHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					   postXHR.send(postParams);
					}).catch(function(error) {
						niceAlert("error2: " + error);
					});		   
				   
				} else {
					hideLoading();
					niceAlert("Please mark one email as unread")
				}
	
			});
		}
		
		$("#testGmailAT").click(function() {
			var account = getFirstActiveAccount(bg.accounts);
			gmailtest(account);
		});
	
		$("#testGmailAT2").click(function() {
			var account = bg.accounts[1];
			gmailtest(account);
		});
	
		$("#testMarkAsRead").click(function() {
			var account = getFirstActiveAccount(bg.accounts);
			gmailtestmarkasread(account);
		});
	
		$("#testMarkAsRead2").click(function() {
			var account = bg.accounts[1];
			gmailtestmarkasread(account);
		});
	
		$("#flushGmailAT").click(function() {
			var account = getFirstActiveAccount(bg.accounts);
			gmailtestmarkasread(account, true);
		});
	
		Polymer.dom($("#version")[0]).textContent = "v." + chrome.runtime.getManifest().version;
		$("#version").click(function() {
			showLoading();
			chrome.runtime.requestUpdateCheck(function(status, details) {
				hideLoading();
				console.log("updatechec:", details)
				if (status == "no_update") {
					openGenericDialog({title:"No update!", otherLabel:getMessage("moreInfo")}).then(function(response) {
						if (response == "other") {
							location.href = "https://jasonsavard.com/wiki/Extension_Updates";
						}
					})
				} else if (status == "throttled") {
					openGenericDialog({title:"Throttled, try again later!"});
				} else {
					openGenericDialog({title:"Response: " + status + " new version " + details.version});
				}
			});
		});
		
		initOptions();	
		initButtons();
		
		setTimeout(function() {
			$("body").removeAttr("jason-unresolved");
			$("body").addClass("explode");
		}, 200)

	});
});