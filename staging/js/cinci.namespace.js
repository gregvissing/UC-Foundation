/*!FOUNDATION cinci.namespace.js */
/*
====================================================================
 Blackbaud ISD Custom Javascript
--------------------------------------------------------------------
 Client: University of Cincinnati
 Author(s): J. Schultz
 Product(s): BBIS
 Created: 2/9/2015
 Updated: 7/29/2015 (by Nick Fogle)
--------------------------------------------------------------------
 Changelog:
====================================================================
 07/23/2015  Nick Fogle - Updated Alumni site root path for API calls
 07/29/2015  Nick Fogle - Refactored Plugin Functions
====================================================================
*/

/*
===================================================
 PLUGINS
---------------------------------------------------
 Additional plugins can be found on DropBox, under:
 Design Team > Javascript > Plugins
---------------------------------------------------
*/

// Insert plugins here...
(function($) {

    $.fn.rssfeed = function(url, options, fn) {
  
        // plugin defaults
        var defaults = {
            ssl: false,
            limit: 10,
            showerror: true,
            errormsg: '',
            date: true,
            dateformat: 'default',
            titletag: 'h4',
            content: true,
            snippet: true,
            snippetlimit: 120,
            linktarget: '_self'
        };
  
  
        // extend options
        options = $.extend(defaults, options);
  
  
        // return functions
        return this.each(function(i, e) {
            var s = '';
  
            // Check for SSL protocol
            if (options.ssl) {
                s = 's';
            }
  
            // add class to container
            if (!$(e).hasClass('rssFeed')) {
                $(e).addClass('rssFeed');
            }
  
            // check for valid url
            if (url === null) {
                return false;
            }
  
            // create yql query
            var query = 'http' + s + '://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from feed where url="' + url + '"');
            if (options.limit !== null) {
                query += ' limit ' + options.limit;
            }
            query += '&format=json';
  
            // send request
            $.getJSON(query, function(data, status, errorThrown) {
                // if successful... *
                if (status === 'success') {
                    // * run function to create html result
                    process(e, data, options);
  
                    // * optional callback function
                    if ($.isFunction(fn)) {
                        fn.call(this, $(e));
                    }
  
                    // if there's an error... *
                } else if (status === 'error' || status === 'parsererror') {
                    // if showerror option is true... *
                    if (options.showerror) {
                        // variable scoping (error)
                        var msg;
  
                        // if errormsg option is not empty... *
                        if (options.errormsg !== '') {
                            // * assign custom error message
                            msg = options.errormsg;
  
                            // if errormsg option is empty... *
                        } else {
                            // * assign default error message
                            msg = errorThrown;
                        }
  
                        // * display error message
                        $(e).html('<div class="rssError"><p>' + msg + '</p></div>');
  
                        // if showerror option is false... *
                    } else {
                        // * abort
                        return false;
                    }
                }
            });
        });
    };
  
    // create html result
    var process = function(e, data, options) {
  
        // Get JSON feed data
        var entries = data.query.results.item;
        // abort if no entries exist
        if (!entries) {
            return false;
        }
  
        // html variables
        var html = '';
        var htmlObject;
  
        // for each entry... *
        $.each(entries, function(i) {
            // * assign entry variable
            var entry = entries[i];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var pubDate;
            var titlelink = entry.title.replace(/[^\w\s]/gi, '');
            var categoryClasses = ' ' + entry.categories.toString().replace(/ &amp; /g, ' ').replace(/ /g, '-').replace(/,/g, ' ');
  
            // if date option is true... *
            if (entry.pubDate) {
                // * create date object
                var entryDate = new Date(entry.pubDate);
  
                // * select date format
                if (options.dateformat === 'default') {
                    pubDate = (entryDate.getMonth() + 1).toString() + '/' + entryDate.getDate().toString() + '/' + entryDate.getFullYear();
                } else if (options.dateformat === 'spellmonth') {
                    pubDate = months[entryDate.getMonth()] + ' ' + entryDate.getDate().toString() + ', ' + entryDate.getFullYear();
                } else if (options.dateformat === 'localedate') {
                    pubDate = entryDate.toLocaleDateString();
                } else if (options.dateformat === 'localedatetime') {
                    pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
                }
            }
  
            // * build entry
            html += '<div class="storyTileOuterWrapper"><div class="storyTileInnerWrapper" data-tag="' + tags + '">';
            html += '<div class="storyTileTextWrapper"><div class="storyTileTitle"><' + options.titletag + '><a href="' + entry.link + '" title="View this feed at ' + entries.title + '">' + entry.title + '</a></' + options.titletag + '>';
            if (options.date && pubDate) {
                html += '<div class="storyTileDate">' + pubDate + '</div>';
            }
  
            // if content option is true... *
            if (options.content) {
                var content = entry.description;
                html += '<div class="storyTileDescription">' + content + '</div>';
            }
            html += '</div>';
        });
  
        // provisional html result
        htmlObject = $(html);
        htmlObject.find('.storyTileInnerWrapper').each(function() {
  
            $(this).prepend('<div class="storyTileImage">');
            $(this).find('.storyTileImage').prepend($(this).find('img').first());
  
        });
        $(e).append(htmlObject);
  
        // Apply target to links
        $('a', e).attr('target', options.linktarget);
    };
  
  })(jQuery);
  
  
  var BBI = BBI || {
  
    Config: {
        version: 1.0,
        updated: '12/22/2015 4:30 PM',
        isEditView: !!window.location.href.match('pagedesign'),
        slideshowRan: false
    },
  
    Defaults: {
        // we have to remove alumni from rootpath, otherwise it won't hit the API Endpoint
        rootpath: (function() {
            var str = BLACKBAUD.api.pageInformation.rootPath;
            var shortString = str.substring(0, str.lastIndexOf("alumni"));
            return shortString;
        })(),
        pageId: BLACKBAUD.api.pageInformation.pageId,
        // this should be set to the GUID of the desingation query for the ADF
        // designationQueryId: "2191ed19-82c5-4941-ad15-39598e90d66d",
        // this should be set the GUID of the designation query that returns highlighted areas
        highlightedFundsQueryId: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === 'https://web.archive.org/web/20180119002129/https://www.alumni.uc.edu/') {
                return "c832a72a-813b-4d01-8606-3cfe8cd9b756";
            } else {
                return "66fcd70c-bbfb-4a99-97da-6efa4370624e";
            }
        })(),
        // the funds to be included in the cascading dropdown
        cascadingFundsQueryId: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === 'https://web.archive.org/web/20180119002129/https://www.alumni.uc.edu/') {
                return "73136bc9-4d41-4abb-a6fc-ff44fc5cb595";
            } else {
                return "5ccf0e08-69e1-4d23-9882-601100a43b4b";
            }
        })(),
        // this should be set to the GUID of the Fund that greatest need gifts are applied to
        greatestNeedFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === 'https://web.archive.org/web/20180119002129/https://www.alumni.uc.edu/') {
                return "898c3603-1440-4b38-9145-19d79effeb2c";
            } else {
                return "7318410e-17bd-4d1f-8437-d5742754a93a";
            }
        })(),
        // this should be set to the GUID of the pledge fund
        pledgeFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === 'https://web.archive.org/web/20180119002129/https://www.alumni.uc.edu/') {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // this should be set to the GUID of the Fund that free text gifts are applied to
        generalFreeFormFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === 'https://web.archive.org/web/20180119002129/https://www.alumni.uc.edu/') {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // GUID for membership fund
        // membershipFundId: "bcf8cd1a-0a22-4f2f-bd14-8040a272d6ed",
        // this should be set to the GUID of the Merchant account (unused - payment part)
        // MerchantAccountId: "864426b2-20a0-43aa-95f6-c850d757b026",
        newsFeedUrl: 'https://web.archive.org/web/20180119002129/https://foundation.uc.edu/feed.rss?id=1',
        customADFAttributes: {
            "Tribute Gift Type": "7b877e86-532a-4851-a1b1-7cd777fd08ec",
            "Honoree Name": "6337f9a2-c611-47f9-a81c-bcb01f457467",
            "Acknowledgee Title": "446bf4a6-e365-468d-bad0-37ce30b0e188",
            "Acknowledgee First Name": "91ca3e25-5831-40fe-9b7a-957f9608b8dd",
            "Acknowledgee Last Name": "3a7e79d5-f5f7-4fd8-8031-77f56b08b255",
            "Acknowledgee Address": "16a044a1-2171-4d1d-8029-48d4cba9f5dc",
            "Acknowledgee City": "f2a00e58-4d26-4c5f-a3c2-9403eb50bd18",
            "Acknowledgee State": "44b0f3c0-c4d6-4343-8355-943fb4703990",
            "Acknowledgee Zip": "f20b1f0b-14a1-40fe-94a6-1c6362db1d17",
            "Acknowledgee Country": "cca52f5c-97eb-4a5d-b3ac-4d7ed9b036a4",
            "Acknowledgee Phone": "030061fe-6a62-4e4d-8129-bc0b60f1ea00",
            "Acknowledgee Email": "93973031-17fc-49d2-a676-70544930a874",
            "UC Graduation Year": "b603114f-2669-400e-a870-186f9b923e08",
            "UC Graduation Degree": "64f2b303-e27a-419c-820f-676674b3004e",
            "Joint Spouse Name": "3a49afdd-9180-40a7-9c31-03ed83736388",
            "Matching Gift Company": "cce2f315-6ba7-4713-891b-5b2c4b422cc6",
            "Pledge ID": "01d9e45d-533f-4759-ba10-07fd687a202c"
        },
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        titleTable: "456ffd4c-0fbf-49db-a503-0726f86e2a39",
  
        amounts: [50, 100, 250, 500, 1000, 1500, 2500, 5000]
    },
  
    Methods: {
  
        pageInit: function() {
            //All functions which should run instantly
            BBI.Methods.menuToggles();
            //Style fixes in admin view
            if (BBI.Config.isEditView) {
                BBI.Methods.adminStyleFixes();
            } else {
                BBI.Methods.headScripts();
                BBI.Methods.navScripts();
                BBI.Methods.vimeoScripts();
                BBI.Methods.initADF();
                BBI.Methods.readTimeScript();
                BBI.Methods.animatedGallery();
                BBI.Methods.modalScripts();
                BBI.Methods.datePicker();
                BBI.Methods.foundationbgFix();
                BBI.Methods.buildSocialButtons();
                BBI.Methods.createMenuSVG();
                BBI.Methods.initAccordions();
                BBI.Methods.newsAndCalendarFeed();
                BBI.Methods.designationSearchFormat();
                BBI.Methods.initEventWrapper();
                BBI.Methods.designationSearchBoxes();
                BBI.Methods.replaceBoxgridTables();
                BBI.Methods.donationAmount();
                BBI.Methods.coerStyles();
                BBI.Methods.initMobileHeader();
                BBI.Methods.mobileSubMenu();
                BBI.Methods.jobOpportunities();
                BBI.Methods.footerBgScript();
                // NEW DONATION FORM
                BBI.Methods.customSingleDonationForm.tbodyClasses();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.fundDesignationOption();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.clickHiddenAmount();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.donationAmount();
  
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingTitleList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingName();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingAddress();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCity();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingZip();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingPhone();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingEmail();
  
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.autoFillExtraction();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.hiddenDataPersistence();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardholder();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardNumber();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardExp();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardCSC();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.submitButton();
                BBI.Methods.customSingleDonationForm.stepToggles();
                BBI.Methods.customSingleDonationForm.hiddenFormValidation();
                $('iframe[id*= twitter]').css('display', 'inline-block');
            }
            //end instant functions
            //Runs on partial page refresh
            Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(function() {
                BBI.Methods.pageRefresh();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
            });
            //Runs on full page
            $(document).ready(function() {
                BBI.Methods.pageLoad();
            });
        },
  
        pageRefresh: function() {
            // Runs on partial page refresh
            BBI.Methods.coerStyles();
            BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
            BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
  
            // Keep Sidebar open for Postbacks on Mobile
            if ($('.mobileCanvas.show-for-small:visible').length && $('tbody[id$=tbdForgotPWDUserName]').length) {
                $('.leftCanvas').toggleClass('expanded', 1000, 'easeInOutQuart');
                $('.rightCanvas').toggleClass('retracted', 1000, 'easeInOutQuart');
            }
            // Hide New User Prompt if Already Signed In
            if ($('.mobileCanvas.show-for-small:visible').length && $('input[id$=btnLogout]').length) {
                $('.mobileCanvas .offcanvasReg').hide();
            }
        },
  
        pageLoad: function() {
            // Runs on full page load
            if (!BBI.Config.isEditView) {
                this.foundationMediaOverlay();
            }
            //add search placeholder
            $('#ucBand input[id*="_txtQuickSearch"]').attr('placeholder', 'Search UC');
            $('.mobileCanvas .QuickSearchTextbox').prop('placeholder', 'Search UC Foundation');
            // payment part 2.0 functions
            if ($('.PaymentPart_FormContainer').length > 0) {
                // remove payment part links
                $('.PaymentPart_CartCell.PaymentPart_CartDescriptionCell > a').contents().unwrap().wrap('<span></span>');
                $(".PaymentPart_CartItemDetails:has('div')").prevAll().hide();
  
                // change "Other" designation text
                if ($('.wrapButtons a:contains("Make Another Gift")').length === 0) {
                    var des = $('.PaymentPart_CartCell.PaymentPart_CartDescriptionCell').find('span:contains("Other")');
                    if (des.length !== 0) {
                        $(des).text('Pledge Payment');
                    }
                }
            }
        },

        headScripts: function() {
            $("link[href*='stylesheet6']").attr("disabled", "disabled");
            console.log("headScripts");
        },

        navScripts: function() {

            // Search placeholder scripts
            $(".SearchTextBox, .QuickSearchTextbox").attr("placeholder", "Search UC Foundation site");
            
            $(".nav.flex.main").attr("role", "list");
      
            var searchSvg = '<svg class="searchIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.14 49.94" fill="#222"><g><path  d="M24.46,0A21.88,21.88,0,0,1,37.87,4.66c3.72,3,5.76,6.73,5.17,11.66a24.31,24.31,0,0,0,0,4.18c.24,4.74-1.9,8.31-5.54,11.05-5,3.75-10.68,4.84-16.77,4.3a15.07,15.07,0,0,1-3.41-.62c-1.12-.37-1.59,0-2.13,1-2.21,3.87-4.5,7.7-6.79,11.53a4.37,4.37,0,0,1-4.69,2.15A4.46,4.46,0,0,1,.09,46.3a4.78,4.78,0,0,1,.73-3.54C3.06,39,5.26,35.21,7.53,31.46a1.15,1.15,0,0,0-.19-1.71,11.19,11.19,0,0,1-3.55-7.86A68.13,68.13,0,0,1,4,13.08c.5-4.4,3.26-7.41,6.89-9.68C14.74,1,19,0,24.46,0Zm-2,25.8c6.28,0,11-1.67,14.18-4.63,4-3.74,4.14-9,.26-12.87A17.26,17.26,0,0,0,26.27,3.56C21,3,16,3.81,11.59,7c-5.7,4.13-5.82,10.62-.29,15A18.58,18.58,0,0,0,22.45,25.8Zm-4.53,6.05a.58.58,0,0,0,.22.12c6.27,1.39,12.17.65,17.45-3.22a9.58,9.58,0,0,0,3.76-5.42C33.09,28.81,25.9,30,18.24,28.74ZM15,29.78c-.29-.32-.61-.92-.89-.9a2,2,0,0,0-1.4.71c-3,4.91-5.88,9.85-8.81,14.78-.41.7-.72,1.45.14,2s1.35-.17,1.76-.85l8.64-14.6C14.65,30.6,14.79,30.27,15,29.78Zm-4-3.78L7.53,23.26l-.29.2,2.37,4.09Z"/></g></svg>'; 
                    
            $("ul.nav li.search a").attr("id", "search-toggle").prepend(searchSvg).attr("aria-expanded", "false");
        
            var expandables = document.querySelector("#search-toggle");
            var searchToggle = document.querySelector(".search-toggle");

            expandables.addEventListener("click", function (e) {
                e.preventDefault();
                var expanded = this.getAttribute("aria-expanded")
                if (expanded === "false") {
                    this.setAttribute("aria-expanded", "true");
                    searchToggle.setAttribute("aria-hidden", "false");
                } else {
                    this.setAttribute("aria-expanded", "false");
                    searchToggle.setAttribute("aria-hidden", "true");
                }
            })
        
            $(".QuickSearchTextbox").attr("placeholder", "Search UC Foundation site");
        
            // Add Menu button to nav
            const svgNavigation = '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" hidden><svg height="21" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: inherit;"><path d="M3 13h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 7h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 19h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1z" fill="currentColor"></path></svg> Navigation</button>';
            
            // Add Close button to mobile nav
            const closeNavigation = '<button id="nav-closeBtn" class="nav-closeBtn" hidden=""><svg height="21" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: inherit;" xmlns="http://www.w3.org/2000/svg"><path d="M 3 13 L 21 13 C 21.552 13 22 12.552 22 12 C 22 11.448 21.552 11 21 11 L 3 11 C 2.448 11 2 11.448 2 12 C 2 12.552 2.448 13 3 13 Z" style="transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)"></path><path d="M 3 13 L 21 13 C 21.552 13 22 12.552 22 12 C 22 11.448 21.552 11 21 11 L 3 11 C 2.448 11 2 11.448 2 12 C 2 12.552 2.448 13 3 13 Z" style="transform-origin: 12px 12px;" transform="matrix(0.707107, -0.707106, 0.707106, 0.707107, 0, 0)"></path></svg> Close</button>';
            
            $("#site-nav").prepend(svgNavigation);
            $("#nav-content").prepend(closeNavigation);
            
            var utils = {
                generateID: function (base) {
                return base + Math.floor(Math.random() * 999);
                },
                focusIsInside(element) {
                return element.contains(document.activeElement);
                }
            };
            
            const icon = `<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.293 9.707l6 6c0.391 0.391 1.024 0.391 1.414 0l6-6c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z"></path></svg>`;
            
            const nav = document.getElementById("site-nav");
            nav.classList.add("enhanced");
            const navButton = document.getElementById("nav-toggle");
            const navCloseBtn = document.getElementById("nav-closeBtn");
            const navContent = document.getElementById("nav-content");
            const isDesktop = window.matchMedia("(min-width: 981px)");
            const main = document.getElementById("main");
            const footer = document.getElementById("main-footer");
            const header = document.getElementById("main-header");
            const siblings = document.querySelectorAll("header > *:not(nav)");
            
            let navIsShown = true;
            
            navCloseBtn.addEventListener("click", function (e) {
                e.preventDefault();
                console.log("close me!");
                hideNav();
                navButton.focus();
                $("body").removeClass("no-scroll");
            }, false );
            
            function hideNav() {
                // nav.classList.add("closed");
                navButton.setAttribute("aria-expanded", "false");
                dropdowns.forEach(function (dropdown) {
                dropdown.setAttribute("hidden", "");
                let btn = dropdown.parentNode.querySelector("button");
                btn.setAttribute("aria-expanded", "false");
                });
                navIsShown = false;
                makeNavInert();
                removePageInert();
            }
            
            function makePageInert() {
                if (main) {
                main.setAttribute("inert", "");
                }
                if (footer) {
                footer.setAttribute("inert", "");
                }
            
                /* 
                            for (var i = 0; i < siblings.length; i++) {
                            siblings[i].setAttribute("inert", "true");
                            } 
                            */
            }
            
            function removePageInert() {
                if (main) {
                main.removeAttribute("inert");
                }
                if (footer) {
                footer.removeAttribute("inert");
                }
            
                for (var i = 0; i < siblings.length; i++) {
                siblings[i].removeAttribute("inert");
                }
            }
            
            function makeNavInert() {
                navContent.setAttribute("inert", "");
            }
            
            function removeNavInert() {
                navContent.removeAttribute("inert");
            }

            function closeNavWhenFocusLeaves(element) {
                var firstClass = "js-first-focus";
                var lastClass = "js-last-focus";
            
                var tabFocusElements =
                    'button:not([hidden]):not([disabled]), [href]:not([hidden]), input:not([hidden]):not([type="hidden"]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex="0"]:not([hidden]):not([disabled]), summary:not([hidden]), [contenteditable]:not([hidden]), audio[controls]:not([hidden]), video[controls]:not([hidden])';
                var focusable = element.querySelectorAll(tabFocusElements);
            
                // the first focusable element is the toggle button, but with the nav open, we don't want that one to be focused
                navCloseBtn.classList.add(firstClass);
                focusable[focusable.length - 1].classList.add(lastClass);
            
                element.addEventListener("keydown", function (e) {
                var keyCode = e.keyCode || e.which;
                var escKey = 27;
                var tabKey = 9;
            
                if (navIsShown) {
                    switch (keyCode) {
                    case escKey:
                        hideNav();
                        navButton.focus();
                        break;
            
                    default:
                        break;
                    }
            
                    if (navIsShown) {
                    var firstFocus = element.querySelector("." + firstClass);
                    var lastFocus = element.querySelector("." + lastClass);
                    }
            
                    if (document.activeElement.classList.contains(lastClass)) {
                    if (keyCode === tabKey && !e.shiftKey) {
                        e.preventDefault();
                        firstFocus.focus();
                    }
                    }
            
                    if (document.activeElement.classList.contains(firstClass)) {
                    if (keyCode === tabKey && e.shiftKey) {
                        e.preventDefault();
                        lastFocus.focus();
                    }
                    }
                }
                });
            }
            
            // var top_level_items = document.querySelectorAll("li[data-has-children]");
            var top_level_items = document.querySelectorAll("ul.nav > li.parent");
            // var dropdowns = document.querySelectorAll("li[data-has-children] > ul");
            var dropdowns = document.querySelectorAll("li.parent > ul.nccUlMenuSub1");
            var navID = utils.generateID("nav-");
            
            top_level_items.forEach(function (item, index) {
                const dropdown = item.querySelector(":scope > ul.nccUlMenuSub1");
                dropdown.setAttribute("id", navID + "__ul-" + index);
                dropdown.setAttribute("hidden", "");
            
                // let span = item.querySelector(":scope > span");
                let span = item.querySelector(":scope > a");
                let text = span.innerText;
            
                let item_dw = document.createElement("button");
                item_dw.setAttribute("aria-expanded", "false");
                item_dw.setAttribute("aria-controls", navID + "__ul-" + index);
                item_dw.innerText = text;
                item_dw.innerHTML += icon;
                span.replaceWith(item_dw);
                item_dw.addEventListener("click", function (e) {
                e.preventDefault();
                toggleDropdown(item_dw, dropdown);
                });
            
                dropdown.addEventListener(
                "keydown",
                function (e) {
                    e.stopImmediatePropagation(); // so that only the list itself closes, not its parent list (in the case of 3+ levels deep nested links)
                    if (e.keyCode === 27 && utils.focusIsInside(dropdown)) {
                    toggleDropdown(item_dw, dropdown);
                    item_dw.focus();
                    }
                },
                false
                );
            });
            
            function toggleDropdown(dw, dropdown) {
                if (dw.getAttribute("aria-expanded") === "true") {
                dw.setAttribute("aria-expanded", "false");
                dropdown.setAttribute("hidden", "");
                } else {
                dw.setAttribute("aria-expanded", "true");
                dropdown.removeAttribute("hidden");
                }
            }
            
            function collapseDropdownsWhenClickingOutsideNav(e) {
                let target = e.target;
                dropdowns.forEach(function (dropdown) {
                if (!dropdown.parentNode.contains(target)) {
                    dropdown.setAttribute("hidden", "");
                    let btn = dropdown.parentNode.querySelector("button");
                    btn.setAttribute("aria-expanded", "false");
                }
                });
            }

            function collapseDropdownsWhenTabbingOutsideNav(e) {
                let target = e.target;
                if (e.keyCode === 9 && !utils.focusIsInside(nav)) {
                dropdowns.forEach(function (dropdown) {
                    dropdown.setAttribute("hidden", "");
                    let btn = dropdown.parentNode.querySelector("button");
                    btn.setAttribute("aria-expanded", "false");
                });
                }
            }
            
            function showNavigationContent() {
                navButton.setAttribute("aria-expanded", "true");
                navIsShown = true;
                removeNavInert();
                makePageInert();
                closeNavWhenFocusLeaves(navContent);
                navCloseBtn.focus();
                $("body").addClass("no-scroll");
            }
            
            // if user tabs out of the navigation, close all open dropdowns
            document.addEventListener("keyup", collapseDropdownsWhenTabbingOutsideNav);
            
            // if user clicks anywhere outside the navigation, close all open dropdowns
            window.addEventListener("click", collapseDropdownsWhenClickingOutsideNav);
            
            const handleResize = (e) => {
                if (e.matches) {
                // is "desktop"
                navContent.removeAttribute("hidden");
                navButton.setAttribute("hidden", "");
                navCloseBtn.setAttribute("hidden", "");
            
                navContent.removeAttribute("role");
                navContent.removeAttribute("aria-labelledby");
            
                navCloseBtn.setAttribute("hidden", "");
                removeNavInert();
                removePageInert();
                } else {
                navButton.removeAttribute("hidden");
                navCloseBtn.removeAttribute("hidden");
                navContent.setAttribute("role", "dialog");
                navContent.setAttribute("aria-labelledby", "nav-toggle");
            
                if (navIsShown) {
                    makeNavInert();
                } else {
                    removeNavInert();
                }
            
                navButton.addEventListener("click", showNavigationContent, false);
                }
            };
            
            isDesktop.addEventListener("change", (e) => handleResize(e));
            handleResize(isDesktop);

        },

        vimeoScripts: function() {
            // Video Play/Pause functionality
            function initVimeoVideo() {
                var iframe = $("#player1")[0];
                var player = new Vimeo.Player(iframe);

                // Close using the close icon
                $(".pause").on("click", function(e) {
                    e.preventDefault();
                    var method = "pause";
                    player[method]();
                    $(".play, .pause").toggleClass("disabled");
                });

                // Close using the modal
                $(".play").on("click", function(e) {
                    e.preventDefault();
                    var method = "play";
                    player[method]();
                    $(".play, .pause").toggleClass("disabled");
                });
            }

            if ($(".hero").length) {
                initVimeoVideo();
            }
        },

        animatedGallery: function() {
            
            // Gallery - Pinned image 
            if ($(".gallery").length) {
                const details = gsap.utils.toArray(".desktopContentSection:not(:first-child)");
                const photos = gsap.utils.toArray(".desktopPhoto:not(:first-child)");

                gsap.set(photos, {
                    yPercent: 101
                });

                const allPhotos = gsap.utils.toArray(".desktopPhoto");

                // create
                let mm = gsap.matchMedia();

                // add a media query. When it matches, the associated function will run
                mm.add("(min-width: 600px)", () => {
                    // this setup code only runs when viewport is at least 600px wide
                    // console.log("desktop");

                    ScrollTrigger.create({
                        trigger: ".gallery",
                        start: "top top",
                        end: "bottom bottom",
                        pin: ".right"
                    });

                    //create scrolltrigger for each details section
                    //trigger photo animation when headline of each details section
                    //reaches 80% of window height
                    details.forEach((detail, index) => {
                        let headline = detail.querySelector("h3");
                        let animation = gsap
                            .timeline()
                            .to(photos[index], {
                                yPercent: 0
                            })
                            .set(allPhotos[index], {
                                autoAlpha: 0
                            });
                        ScrollTrigger.create({
                            trigger: headline,
                            start: "top 80%",
                            end: "top 50%",
                            animation: animation,
                            scrub: true,
                            markers: false
                        });
                    });
                    return () => {
                        // optional
                        // custom cleanup code here (runs when it STOPS matching)
                        // console.log("mobile");
                    };
                });
            }

            /**
             * This script is for the skip link and to ensure that moving focus
             * via hashchange is respected in all browsers.
             */

            window.addEventListener("hashchange", function(e) {

                if (location.hash.substring(1) !== '') {
                    var el = document.getElementById(location.hash.substring(1));

                    if (el) {
                        if (!/^(?:a|select|input|button|textarea)$/i.test(el.tagName)) {
                            el.tabIndex = -1;
                        }
                        el.focus();
                    }
                }
            }, false);

        },

        modalScripts: function() {
            
            ;
            (function(w, doc, undefined) {
                'use strict';

                /**
                 * Local object for method references,
                 * define script metadata, and other
                 * global variables.
                 */
                var ARIAmodal = {};
                w.ARIAmodal = ARIAmodal;

                ARIAmodal.NS = 'ARIAmodal';
                ARIAmodal.AUTHOR = 'Scott O\'Hara';
                ARIAmodal.VERSION = '3.4.1';
                ARIAmodal.LICENSE = 'https://github.com/scottaohara/accessible_modal_window/blob/master/LICENSE';

                var activeClass = 'modal-open';
                var body = doc.body;
                var main = doc.getElementsByTagName('main')[0] || body;

                var modal = doc.querySelectorAll('[data-modal]');
                var children = doc.querySelectorAll('body > *:not([data-modal])');

                var initialTrigger;
                var activeModal;
                var useAriaModal = false;
                var returnToBody = false;

                var firstClass = 'js-first-focus';
                var lastClass = 'js-last-focus';

                var tabFocusElements = 'button:not([hidden]):not([disabled]), [href]:not([hidden]), input:not([hidden]):not([type="hidden"]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex="0"]:not([hidden]):not([disabled]), summary:not([hidden]), [contenteditable]:not([hidden]), audio[controls]:not([hidden]), video[controls]:not([hidden])';

                /**
                 * Function to place the modal dialog(s) as the first child(ren)
                 * of the body element, so tabbing backwards will move focus
                 * into the browser's chrome.
                 */
                ARIAmodal.organizeDOM = function() {
                    var refEl = body.firstElementChild || null;
                    var i;

                    for (i = 0; i < modal.length; i++) {
                        body.insertBefore(modal[i], refEl);
                    }
                };

                /**
                 * Global Create
                 *
                 * This function validates that the minimum required markup
                 * is present to create the ARIA widget(s).
                 *
                 * Any additional markup elements or attributes that
                 * do not exist in the found required markup patterns
                 * will be generated setup functions.
                 */
                ARIAmodal.setupTrigger = function() {
                    var trigger = doc.querySelectorAll('[data-modal-open]');
                    var self;
                    var i;

                    for (i = 0; i < trigger.length; i++) {
                        self = trigger[i];
                        var getOpenTarget = self.getAttribute('data-modal-open');
                        var hasHref = self.getAttribute('href');

                        /**
                         * If not a button, update the semantics to make the element
                         * announce as a button and provide it a tabindex=0 to
                         * ensure it is keyboard focusable.
                         */
                        if (self.nodeName !== 'BUTTON') {
                            self.setAttribute('role', 'button');
                            self.tabIndex = 0;
                        }

                        /**
                         * If getOpenTarget was the empty string, but there is an
                         * href attribute, then get the possible target from the href
                         */
                        if (getOpenTarget === '' && hasHref) {
                            self.setAttribute('data-modal-open', hasHref.split('#')[1]);
                            getOpenTarget = hasHref.split('#')[1];
                        }

                        /**
                         * If an <a href> was changed to a role=button, then the context
                         * menu of the 'button' should no longer act as if it's for a link.
                         * Removing the href attribute will negate the link context menu
                         * if a user performs a right-click.
                         */
                        self.removeAttribute('href');

                        /**
                         * Check for if a data-modal-open attribute is on
                         * a button. If not, then the button targets nothing
                         * and there's not much that can be done with that.
                         */
                        if (getOpenTarget) {
                            /**
                             * A button should have an aria-haspopup="dialog" to convey to users that
                             * *this* button will launch a modal dialog.
                             *
                             * Presently, the "dialog" value is not fully supported and in unsupported
                             * instances, it defaults back to announcing that a "menu" will open.
                             * Use this attribute with caution until this value has wider support.
                             */
                            // self.setAttribute('aria-haspopup', 'dialog');

                            /**
                             * Remove the disabled attribute, as if this script is running, JavaScript
                             * must be enabled and thus the button should function.
                             *
                             * But wait...there may be value in having a disabled button that can be
                             * enabled via other user actions. So, in that scenario look for a
                             * data-modal-disabled attribute, to keep the button disabled.
                             */
                            if (self.hasAttribute('disabled') && !self.hasAttribute('data-modal-disabled')) {
                                self.removeAttribute('disabled');
                            }

                            /**
                             * In instances when JavaScript is unavailable and a disabled
                             * button is not desired, a hidden attribute can be used to
                             * completely hide the button.
                             *
                             * Remove this hidden attribute to reveal the button.
                             */
                            self.removeAttribute('hidden');

                            /**
                             * Get modal target and supply the button with a unique ID to easily
                             * reference for returning focus to, once the modal dialog is closed.
                             */
                            self.id = getOpenTarget + '__trigger-' + self.nodeName + '-' + i;

                            /**
                             * Events
                             */
                            self.addEventListener('click', ARIAmodal.openModal);
                            self.addEventListener('keydown', ARIAmodal.keyEvents, false);
                        } else {
                            console.warn('Missing target modal dialog - [data-modal-open="IDREF"]');
                        }
                    } // for(widget.length)
                }; // ARIAmodal.setupTrigger()

                /**
                 * Setup the necessary attributes and child elements for the
                 * modal dialogs.
                 */
                ARIAmodal.setupModal = function() {
                    var self;
                    var i;

                    for (i = 0; i < modal.length; i++) {
                        self = modal[i];
                        var modalType = self.getAttribute('data-modal');
                        var getClass = self.getAttribute('data-modal-class') || 'a11y-modal';
                        var heading = self.querySelector('h1, h2, h3, h4, h5, h6');
                        var modalLabel = self.getAttribute('data-modal-label');
                        var hideHeading = self.hasAttribute('data-modal-hide-heading');
                        var modalDesc = self.querySelector('[data-modal-description]');
                        var modalDoc = self.querySelector('[data-modal-document]');

                        /**
                         * Check to see if this is meant to be an alert or normal dialog.
                         * Supply the appropriate role.
                         */
                        if (modalType === 'alert') {
                            self.setAttribute('role', 'alertdialog');
                        } else {
                            self.setAttribute('role', 'dialog');
                        }

                        /**
                         * Set either the default dialog class or a class passed
                         * in from the data-modal-class attribute.
                         */
                        self.classList.add(getClass);

                        /**
                         * Modal dialogs need to be hidden by default.
                         *
                         * To ensure they stay hidden, even if CSS is disabled, or purposefully
                         * turned off, apply a [hidden] attribute to the dialogs.
                         */
                        self.hidden = true;

                        /**
                         * When a modal dialog is opened, the dialog itself
                         * should be focused. Set a tabindex="-1" to allow this
                         * while keeping the container out of the focus order.
                         */
                        self.tabIndex = '-1';

                        /**
                         * Older versions of NVDA used to automatically turn on forms mode
                         * when a user entered a modal dialog. A role="document", surrounding
                         * the content of the dialog would allow non-form dialogs to be
                         * navigated correctly by the virtual cursor.
                         *
                         * If a dialog needs to be compatible with older NVDA, look for
                         * a data-modal-document, and give that a role=document.
                         */
                        if (modalDoc) {
                            modalDoc.setAttribute('role', 'document');
                        }

                        /**
                         * Modal dialogs need at least one actionable item
                         * to close them...
                         */
                        ARIAmodal.setupModalCloseBtn(self, getClass, modalType);

                        /**
                         * The aria-modal attribute currently makes it difficult to navigate
                         * through the contents of a modal dialog with VoiceOver.
                         *
                         * Up/down arrows do not have access to all content, and
                         * using VO + left/right also do not have access to all
                         * content, but do have access to different content then
                         * up/down arrows alone.
                         *
                         * Note: The VoiceOver issues should be fixed with the release
                         * of Safari 12.
                         *
                         * Additionally, NVDA will mostly respect the aria-modal attribute
                         * with one notable bug, where if a user navigates to the address
                         * bar via NVDA key + F6, a user can re-enter document that is obscured
                         * by the open dialog, and can navigate the content 'beneath' the
                         * dialog with arrow keys, or quick keys.
                         *
                         * Using the tab key inconsistently returns a user to the modal
                         * dialog's contents, or may produce no keyboard focus change.
                         *
                         * This attribute can be added to a particular dialog if the
                         * dialog has a data-aria-modal attribute set.
                         */
                        if (self.hasAttribute('data-aria-modal')) {
                            self.setAttribute('aria-modal', 'true');
                        }

                        /**
                         * Do a check to see if there is an element flagged to be the
                         * description of the modal dialog.
                         */
                        if (modalDesc) {
                            modalDesc.id = modalDesc.id || 'md_desc_' + Math.floor(Math.random() * 999) + 1;
                            self.setAttribute('aria-describedby', modalDesc.id);
                        }

                        /**
                         * Check for a heading to set the accessible name of the dialog,
                         * or if an aria-label should be set to the dialog instead.
                         */
                        if (modalLabel) {
                            self.setAttribute('aria-label', modalLabel);
                        } else {
                            if (heading) {
                                var makeHeading = self.id + '_heading';
                                heading.classList.add(getClass + '__heading');
                                heading.id = makeHeading;

                                /**
                                 * Set an aria-labelledby to the modal dialog container.
                                 */
                                self.setAttribute('aria-labelledby', makeHeading);

                                if (heading.hasAttribute('data-autofocus')) {
                                    heading.tabIndex = '-1';
                                }
                            } else {
                                console.warn('Dialogs should have their purpose conveyed by a heading element (h1).');
                            }
                        }

                        /**
                         * If a dialog has a data-modal-hide-heading attribute, then that means this
                         * dialog's heading should be visually hidden.
                         */
                        if (hideHeading) {
                            self.querySelector('#' + heading.id).classList.add('at-only');
                        }

                        /**
                         * Get all focusable elements from within a dialog and set the
                         * first and last elements to have respective classes for later looping.
                         */
                        var focusable = self.querySelectorAll(tabFocusElements);
                        focusable[0].classList.add(firstClass);
                        focusable[focusable.length - 1].classList.add(lastClass);
                    }
                }; // ARIAmodal.setupModal

                /**
                 * Setup any necessary close buttons, and add appropriate
                 * listeners so that they will close their parent modal dialog.
                 */
                ARIAmodal.setupModalCloseBtn = function(self, modalClass, modalType) {
                    var doNotGenerate = self.hasAttribute('data-modal-manual-close');
                    var manualClose = self.querySelectorAll('[data-modal-close-btn]');
                    var modalClose = self.getAttribute('data-modal-close');
                    var modalCloseClass = self.getAttribute('data-modal-close-class');
                    var closeIcon = '<span data-modal-x></span>';
                    var btnClass = modalClass;
                    var i;

                    if (!doNotGenerate) {
                        if (manualClose.length < 2) {
                            var closeBtn = doc.createElement('button');
                            closeBtn.type = 'button';

                            /**
                             * If a custom class is set, set that class
                             * and create BEM classes for direct child elements.
                             *
                             * If no custom class set, then use default "a11y-modal" class.
                             */
                            self.classList.add(modalClass);
                            closeBtn.classList.add(modalClass + '__close-btn');

                            /**
                             * If there is no data-modal-close attribute, or it has no set value,
                             * then inject the close button icon and text into the generated button.
                             *
                             * If the data-modal-close attribute has a set value, then use that as the
                             * visible text of the close button, and do not position it in the upper right
                             * of the modal dialog.
                             */
                            if (!modalClose && modalType !== 'alert') {
                                closeBtn.innerHTML = closeIcon;
                                closeBtn.setAttribute('aria-label', 'Close');
                                closeBtn.classList.add('is-icon-btn');
                            } else {
                                closeBtn.innerHTML = modalClose;

                                if (modalCloseClass) {
                                    closeBtn.classList.add(modalCloseClass);
                                }
                            }

                            if (modalType !== 'alert') {
                                if (self.querySelector('[role="document"]')) {
                                    self.querySelector('[role="document"]').appendChild(closeBtn);
                                } else {
                                    self.appendChild(closeBtn);
                                }
                            }

                            closeBtn.addEventListener('click', ARIAmodal.closeModal);
                        }
                    }

                    for (i = 0; i < manualClose.length; i++) {
                        manualClose[i].addEventListener('click', ARIAmodal.closeModal);
                    }

                    doc.addEventListener('keydown', ARIAmodal.keyEvents, false);
                }; // ARIAmodal.setupModalCloseBtn

                /**
                 * Actions
                 */
                ARIAmodal.openModal = function(e, autoOpen) {
                    var i;
                    var getTargetModal = autoOpen || this.getAttribute('data-modal-open');
                    // Update the activeModal
                    activeModal = doc.getElementById(getTargetModal);

                    var focusTarget = activeModal; // default to the modal dialog container
                    var getAutofocus = activeModal.querySelector('[autofocus]') || activeModal.querySelector('[data-autofocus]');

                    useAriaModal = activeModal.hasAttribute('aria-modal');

                    /**
                     * If a modal dialog was auto-opened, then a user should
                     * be returned to the top of the document when the modal
                     * is closed, so that they do not have to figure out where
                     * they've been placed in the DOM
                     */
                    if (autoOpen) {
                        returnToBody = true;
                    }

                    /**
                     * If a modal was auto-opened on page load, then the
                     * following do not apply.
                     */
                    if (!autoOpen) {
                        /**
                         * In case these are links, negate default behavior and just
                         * do what this script tells these triggers to do.
                         */
                        e.preventDefault();

                        /**
                         * Keep track of the trigger that opened the initial dialog.
                         */
                        initialTrigger = this.id;
                    }

                    /**
                     * If a modal dialog contains an that is meant to be autofocused,
                     * then focus should be placed on that element (likely form control),
                     * instead of the wrapping dialog container.
                     *
                     * If a dialog has an attribute indicating the close button should
                     * be autofocused, focus the first close button found.
                     */
                    if (getAutofocus) {
                        focusTarget = getAutofocus;
                    } else if (activeModal.hasAttribute('data-modal-close-focus')) {
                        focusTarget = activeModal.querySelector('[class*="close-btn"]');
                    }

                    /**
                     * Do a check to see if a modal is already open.
                     * If not, then add a class to the body as a check
                     * for other functions and set contents other than
                     * the opened dialog to be hidden from screen readers
                     * and to not accept tab focus, nor for their child elements.
                     */
                    if (!body.classList.contains(activeClass)) {
                        body.classList.add(activeClass);

                        for (i = 0; i < children.length; i++) {
                            if (!useAriaModal) {
                                if (children[i].hasAttribute('aria-hidden')) {
                                    children[i].setAttribute('data-keep-hidden', children[i].getAttribute('aria-hidden'));
                                }
                                children[i].setAttribute('aria-hidden', 'true');
                            }

                            if (children[i].getAttribute('inert')) {
                                children[i].setAttribute('data-keep-inert', '');
                            } else {
                                children[i].setAttribute('inert', 'true');
                            }
                        }
                    } else {
                        console.warn('It is not advised to open dialogs from within other dialogs. Instead consider replacing the contents of this dialog with new content. Or providing a stepped, or tabbed interface within this dialog.');
                    }

                    activeModal.removeAttribute('hidden');

                    // Mostly reliable fix for iOS issue where VO focus is not moved
                    // to the dialog on open. Credit to Thomas Jaggi - codepen.io/backflip
                    // for the fix.
                    requestAnimationFrame(function() {
                        focusTarget.focus();
                    });

                    doc.addEventListener('click', ARIAmodal.outsideClose, false);
                    doc.addEventListener('touchend', ARIAmodal.outsideClose, false);

                    return [initialTrigger, activeModal, returnToBody];
                };

                /**
                 * Function for closing a modal dialog.
                 * Remove inert, and aria-hidden from non-dialog parent elements.
                 * Remove activeClass from body element.
                 * Focus the appropriate element.
                 */
                ARIAmodal.closeModal = function(e) {
                    var trigger = doc.getElementById(initialTrigger) || null;
                    var i;
                    var m;

                    /**
                     * Loop through all the elements that were hidden to
                     * screen readers, and had inert to negate their
                     * children from being focusable.
                     */
                    for (i = 0; i < children.length; i++) {
                        if (!children[i].hasAttribute('data-keep-inert')) {
                            children[i].removeAttribute('inert');
                        }

                        children[i].removeAttribute('data-keep-inert');

                        if (children[i].getAttribute('data-keep-hidden')) {
                            children[i].setAttribute('aria-hidden', children[i].getAttribute('data-keep-hidden'));
                        } else {
                            children[i].removeAttribute('aria-hidden');
                        }

                        children[i].removeAttribute('data-keep-hidden');
                    }

                    /**
                     * When a modal closes:
                     * the modal-open flag on the body can be removed,
                     * and the modal should be reset to hidden.
                     */
                    body.classList.remove(activeClass);

                    for (m = 0; m < modal.length; m++) {
                        if (!modal[m].hasAttribute('hidden')) {
                            modal[m].hidden = true;
                        }
                    }

                    /**
                     * Return focus to the trigger that opened the modal dialog.
                     * If the trigger doesn't exist for some reason, move focus to
                     * either the <main>, or <body> instead.
                     * Reset initialTrigger and activeModal since everything should be reset.
                     */
                    if (trigger !== null) {
                        trigger.focus();
                    } else {
                        if (main && !returnToBody) {
                            main.tabIndex = -1;
                            main.focus();
                        } else {
                            body.tabIndex = -1;
                            body.focus();
                        }
                    }

                    initialTrigger = undefined;
                    activeModal = undefined;
                    returnToBody = false;

                    return [initialTrigger, activeModal, returnToBody];
                };

                /**
                 * Keyboard controls for when the modal dialog is open.
                 * ESC should close the dialog (when not an alert)
                 */
                ARIAmodal.keyEvents = function(e) {
                    var keyCode = e.keyCode || e.which;
                    var escKey = 27;
                    var enterKey = 13;
                    var spaceKey = 32;
                    var tabKey = 9;
                    var firstFocus, lastFocus;

                    if (e.target.hasAttribute('data-modal-open')) {
                        switch (keyCode) {
                            case enterKey:
                            case spaceKey:
                                e.preventDefault();
                                e.target.click();
                                break;
                        }
                    }

                    if (body.classList.contains(activeClass)) {
                        switch (keyCode) {
                            case escKey:
                                ARIAmodal.closeModal();
                                break;

                            default:
                                break;
                        }

                        if (body.classList.contains(activeClass)) {
                            // Get first and last focusable elements from activeModal
                            firstFocus = activeModal.querySelector('.' + firstClass);
                            lastFocus = activeModal.querySelector('.' + lastClass);
                        }

                        if (doc.activeElement.classList.contains(lastClass)) {
                            if (keyCode === tabKey && !e.shiftKey) {
                                e.preventDefault();
                                if (firstFocus !== undefined) {
                                    firstFocus.focus();
                                }
                            }
                        }

                        if (doc.activeElement.classList.contains(firstClass)) {
                            if (keyCode === tabKey && e.shiftKey) {
                                e.preventDefault();
                                if (lastFocus !== undefined) {
                                    lastFocus.focus();
                                }
                            }
                        }
                    }
                }; // ARIAmodal.keyEvents()

                /**
                 * If a dialog is opened and a user mouse clicks or touch screen taps outside
                 * the visible bounds of the dialog content (onto the overlay 'screen') then
                 * the dialog should run the close function.
                 */
                ARIAmodal.outsideClose = function(e) {
                    if (body.classList.contains(activeClass) && !e.target.hasAttribute('data-modal-open')) {
                        var isClickInside = activeModal.contains(e.target);

                        if (!isClickInside && activeModal.getAttribute('role') !== 'alertdialog') {
                            ARIAmodal.closeModal();
                        }
                    }
                }; // ARIAmodal.outsideClose()

                /**
                 * Open a modal dialog on page load
                 */
                ARIAmodal.autoLoad = function() {
                    var getAuto = doc.querySelectorAll('[data-modal-auto]');
                    var hashValue = w.location.hash || null;
                    var autoOpen;
                    var useHash = false;
                    var e = null;

                    /**
                     * A modal ID in the URL should take precedent over any data attributes on
                     * the page. The script must first check if a hash exists, and then if so,
                     * does it match an ID in the document? And finally, is that ID associated
                     * with a modal dialog?  If so, set useHash to TRUE.
                     */
                    if (hashValue !== null) {
                        autoOpen = hashValue.split('#')[1];

                        // stop right here if a stray hash is at the end of the URL
                        if (autoOpen === '') {
                            return false;
                        } else if (autoOpen === '!null') {
                            return false;
                        } else {
                            // Check that the hash actually represent an element, or is it null?
                            var checkforDialog = doc.getElementById(autoOpen) || null;

                            // If not null...
                            if (checkforDialog !== null) {
                                // Do a final check to ensure the hash/ID is for a dialog or alertdialog
                                // and if so, return useHash as TRUE
                                if (checkforDialog.getAttribute('role') === 'dialog' || checkforDialog.getAttribute('role') === 'alertdialog') {
                                    useHash = true;
                                }
                            }
                        }
                    }

                    /**
                     * Since only a single modal should be open at a time, perform the following
                     * if/else checks:
                     *
                     * If a URL contains a fragment that matches the ID of a dialog, auto open it.
                     *
                     * Else If the attribute was found on a dialog container, then directly perform
                     * the openModal function.
                     *
                     * Else If a button or "button" was found with the attribute data-modal-auto,
                     * then perform a click to auto-open this dialog.
                     *
                     * If a dialog or button does not have the attribute data-modal-auto-persist,
                     * then update the URL fragment to a value that will not open a modal dialog on
                     * subsequent reloads.
                     *
                     * If data-modal-auto-persist does exist, then you can continue to bother your
                     * users with likely a poor user experience. :)
                     */

                    if (useHash) {
                        ARIAmodal.openModal(e, autoOpen);

                        if (getAuto.length > 1) {
                            console.warn('Only the modal indicated by the hash value will load.');
                        }
                    } else if (getAuto.length !== 0) {
                        if (getAuto[0].getAttribute('role') === 'dialog' || getAuto[0].getAttribute('role') === 'alertdialog') {

                            autoOpen = getAuto[0].id;
                            ARIAmodal.openModal(e, autoOpen);

                            if (getAuto.length > 1) {
                                console.warn('Multiple modal dialogs can not auto load.');
                            }
                        } else if (getAuto[0].getAttribute('role') === 'button' || getAuto[0].tagName === 'BUTTON') {
                            autoOpen = getAuto[0].id;
                            getAuto[0].click();
                        }
                    }

                    /**
                     * Ideally a user shouldn't have to be barraged with the same modal dialog over
                     * and over again, if they refresh their browser window.
                     *
                     * So unless the attribute "data-modal-auto-persist" exists, which should be used
                     * to specifically state that a particular dialog should continue to auto-load,
                     * regardless of page refresh, modify the URL fragment to a string that will
                     * not auto-load a modal.
                     */
                    if (getAuto.length !== 0 && !doc.getElementById(autoOpen).hasAttribute('data-modal-auto-persist')) {
                        w.location.replace("#!null");
                    }
                };

                /**
                 * Initialize modal functions.
                 * If expanding this script, put
                 * additional initialize functions here.
                 */
                ARIAmodal.init = function() {
                    ARIAmodal.organizeDOM();
                    ARIAmodal.setupTrigger();
                    ARIAmodal.setupModal();
                    ARIAmodal.autoLoad();
                };

                /**
                 * Go go JavaScript!
                 */
                ARIAmodal.init();

            })(window, document);

        },

        footerBgScript: function() {
             
            function getRndInteger(min, max) {
                var value = Math.floor(Math.random() * (3 - 0)) + 0;
                switch (value) {
                    case 0:
                        document.getElementById("footer").style.backgroundPosition = "center top";
                        break;
                    case 1:
                        document.getElementById("footer").style.backgroundPosition = "center center";
                        break;
                    case 2:
                        document.getElementById("footer").style.backgroundPosition = "center bottom";
                        break;
                    default:
                        document.getElementById("footer").style.backgroundPosition = "center center";
                }
                return value;
            }
        
            getRndInteger(0, 3);

        },

        readTimeScript: function() {
            
            // Get the article text
            var el = document.getElementById("article");
            if (el != null) {
                const articleText = document.getElementById("article").innerText;
                const time = document.getElementById("time");

                // Split the text into an array of words
                const wordsArray = articleText.split(" ");

                // Count the number of words in the array
                const wordCount = wordsArray.length;

                // Calculate the estimated reading time
                const wordsPerMinute = 200;
                const readingTime = Math.ceil(wordCount / wordsPerMinute);

                // Display the estimated reading time
                time.innerHTML = readingTime + " min read";
            }

        },
  
        createMenuSVG: function() {
            $('.alumni #mainMenu .mainMenu .nccUlMenuSub2').each(function() {
                var height = $(this).height();
                var width = Math.floor(height / 10);
                $(this).append('<svg viewbox="0 0 ' + width + ' ' + height + '" height="' + height + '" width="' + width + '" style="position:absolute; top: 0; right: -' + (width - 1) + 'px" ><polygon points="0,0 0,' + height + ' ' + width + ',0" style="fill:#de1c24;" /></svg>');
            });
        },
  
        initAccordions: function() {
            if ($('table.accordionTable').length > 0) {
                $('table.accordionTable').each(function() {
                    $(this).replaceWith($(this).html()
                        .replace(/<tbody/gi, "<div class='accordionWrapper'")
                        .replace(/<td/gi, "<div")
                        .replace(/<\/td>/gi, "</div>")
                        .replace(/<\/tbody/gi, "<\/div")
                    );
                });
                $('.accordionWrapper').each(function() {
                    $(this).find('.headerRow').on('click', function() {
                        $(this).parent().find('.contentRow').slideToggle(300);
                        $(this).parent().find('.headerRow').toggleClass('active');
                    });
                });
            }
        },
  
        coerStyles: function() {
            if ($('#status-table').length !== 0) {
                $('#status-table').addClass('clearfix');
                $('span[id*="rptAttendeesDetails"]').not('[style], [id*="udpAttendees"]').parent('td, div.cell').addClass('labelTd');
                $('[id*="udpAttendees"]').parent('td, div.cell').addClass('mainTd');
                if ($('.mainTd').length > 1) {
                    $('.mainTd').css('width', '50%');
                    $('.mainTd').last().css('border-left', '1px solid #CCC').css('padding-left', '10px');
                    $('#divWizardButtons').css('max-width', '100%');
                }
            }
        },
  
        donationAmount: function() {
            var amountValue = BLACKBAUD.api.querystring.getQueryStringValue('amount');
            if (amountValue.length !== 0 && $('.DonationFormTable input[id$="txtAmount"]').length !== 0) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
            } else if (amountValue.length !== 0 && $('#advancedDonationForm input[id$="txtAmount"]').length !== 0) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
                $('.amountButton .selected').removeClass('selected');
                $('#adfOtherLabel').hide();
                $('#txtAmount').show().val(amountValue);
                $('.adfTotalAmount span').text(amountValue);
            }
        },
  
        foundationMediaOverlay: function() {
            // set the backgroundimage to show,
            // since the following code will hide if need be
            //$('.wrapBreadcrumbs p img').show();
  
  
  
            if ($('#internalPage .mediaBoxOverlay').length !== 0) {
                var parentDiv = $('.mediaBoxOverlay').closest('.container');
                if ($(window).width() > 768) {
                    // $('.mediaBoxOverlay').css('height', $('.mediaBoxOverlay').parent().height() - 30);
                }
                parentDiv.append('<i class="mediaBoxToggle">');
                $('.mediaBoxToggle').on('click', function() {
  
                    $('.mediaBoxOverlay').toggle({
                        effect: "scale",
                        direction: "both",
                        origin: ["bottom", "right"]
                    });
                    $(this).toggleClass('expanded');
                });
            } else if ($('#internalPage.alumni .wrapBreadcrumbs p img').length !== 0) {
                var backgroundImage = $('.wrapBreadcrumbs p img');
                var backgroundImageURL = backgroundImage.attr('src');
                $('.fullWidthBackgroundImage').css({
                    'background-image': 'url(' + backgroundImageURL + ')',
                    'background-position': 'center top'
                });
                backgroundImage.closest('p').hide();
            } else if ($('#homePage .mediaBoxOverlay').length !== 0) {
                var backgroundImage = $('.wrapBreadcrumbs p img');
                var backgroundImageURL = backgroundImage.attr('src');
                $('.fullWidthBackgroundImage').css({
                    'background-image': 'url(' + backgroundImageURL + ')',
                    'background-position': 'center top'
                });
                backgroundImage.closest('p').hide();
            }
  
            if ($('.utilityMenus .offcanvasReg').length !== 0) {
                if ($('.utilityMenus a[id*="lbtnRegisterUser"]').length !== 0) {
                    $('.utilityMenus a[id*="lbtnRegisterUser"]').after($('.utilityMenus .offcanvasReg'));
                }
  
                $('.utilityMenus table[id*="tbl"]').wrap('<div class="animatedReveal">');
                $('.utilityMenus li.login a').on('click', function() {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        $('.utilityMenus table[id*="tbl"]').hide('blind', 'slow');
                    } else {
                        $(this).addClass('active');
                        $('.utilityMenus table[id*="tbl"]').show('blind', 'slow');
                    }
                });
            }
        },
  
        // date picker behavior
        datePicker: function() {
            // today's date
            var date = new Date(),
                today = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }).replace(/\u200E/g, '');
  
            if ($('html').hasClass('-ms-')) {
                // $('#startDate').val(today);
                $('#pledgeStartDate').val(today);
            } else {
                // $('#startDate').val(new Date(today).toISOString().substring(0, 10));
                $('#pledgeStartDate').val(new Date(today).toISOString().substring(0, 10));
            }
  
            // normalized date attribute
            // $('#startDate').attr('data-date', today);
            $('#pledgeStartDate').attr('data-date', today);
  
            if ($("#startDate").length !== 0) {
                var d = new Date(),
                    day = d.getDate();
  
                function getMinDate() {
                    var date = new Date();
                    if (day > 15) {
                        date.setMonth(date.getMonth() + 1, 1);
                    } else if (day == 1) {
                        // set to current date
                    } else {
                        date.setDate(15);
                    }
                    return date;
                }
                $("#startDate").datepicker({
                    beforeShowDay: function(dt) {
                        return [
                            dt.getDate() == 1 || dt.getDate() == 15 ?
                            true :
                            false,
                        ];
                    },
                    minDate: getMinDate(),
                });
                $("#startDate").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());
  
                if ($("#startDate").hasClass("month-year")) {
                    console.log("payroll deduction!");
                } else {
                    console.log("advanced donation form!");
                    $("#ui-datepicker-div").addClass("show-calendar");
                }
  
                $("#endDate").datepicker({
                    minDate: getMinDate()
                });
            }
  
            if ($("#startMonth").length !== 0) {
                var d = new Date(),
                    day = d.getDate();
  
                function getMinDate() {
                    var date = new Date();
  
                    date.setMonth(date.getMonth() + 1, 1);
                    /*
                      if (day > 15) {
                          date.setMonth(date.getMonth() + 1, 1);
                      } else if (day == 1) {
                          // set to current date
                      } else {
                          date.setDate(15);
                    } */
                    return date;
                }
  
                $("#startMonth").datepicker({
                    changeMonth: true,
                    changeYear: true,
                    showButtonPanel: true,
                    dateFormat: 'MM yy',
                    onClose: function(dateText, inst) {
                        $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                    },
                    minDate: getMinDate(),
                });
  
                $("#startMonth").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());
  
            }
  
        },
  
        replaceBoxgridTables: function() {
            // Replace HTML tables with DIVs - landing page box grid elements
            if ($('.boxGridTable').length > 0) {
                $('table.boxGridTable').each(function() {
                    $(this).replaceWith($(this).html()
                        .replace(/<tbody/gi, "<div class='boxGrid'")
                        .replace(/<tr/gi, "<div class='gutter clearfix'")
                        .replace(/<td/gi, "<div")
                        .replace(/<\/th>/gi, "</div>")
                        .replace(/<\/td>/gi, "</div>")
                        .replace(/<\/tbody/gi, "<\/div")
                    );
                });
                $('.boxGrid').wrapAll('<div id="boxGridWrapper" />');
                $('#boxGridWrapper').wrapInner('<div class="gutter clearfix" />');
            }
  
            if ($('.boxGrid').length !== 0) {
                $('.boxGrid').hover(function() {
                    $('.boxGridCaption', this).stop().animate({
                        opacity: '0'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                    $('.boxGridReveal', this).stop().animate({
                        bottom: '0'
                    }, {
                        opacity: '1'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                }, function() {
                    $('.boxGridCaption', this).stop().animate({
                        opacity: '1'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                    $('.boxGridReveal', this).stop().animate({
                        bottom: '-100%'
                    }, {
                        opacity: '0'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                });
            }
        },
  
        menuToggles: function() {
            $('.leftCanvas .menuToggle').on('click', function(e) {
                e.preventDefault();
                $('#BodyId').toggleClass('menu-open');
                $('.leftCanvas').toggleClass('expanded');
                $('.rightCanvas').toggleClass('retracted');
                setTimeout(function() {
                    $("#mobileLogo").toggleClass('expanded');
                }, $("#mobileLogo").hasClass('expanded') ? 600 : 0);
            });
            $('.rightCanvas .menuToggle').on('click', function(e) {
                e.preventDefault();
                $('#BodyId').toggleClass('menu-open');
                $('.fa').toggleClass('fa-bars fa-close');
                $(this).toggleClass('open');
                $('.rightCanvas').toggleClass('expanded');
                $('.leftCanvas').toggleClass('retracted');
                setTimeout(function() {
                    $("#mobileLogo").toggleClass('expanded');
                }, $("#mobileLogo").hasClass('expanded') ? 600 : 0);
            });
        },
  
        designationSearchFormat: function() {
            if ($('span.designationInfoBoxOuter').length !== 0) {
                var desingationItems = $("span.designationInfoBoxOuter");
                for (var i = 0; i < desingationItems.length; i += 3) {
                    desingationItems.slice(i, i + 3).wrapAll("<div style='clear:both'></div>");
                }
            }
        },
  
        newsAndCalendarFeed: function() {
            if ($('.eventTileOuterWrapper').length !== 0) {
                $('.eventTileOuterWrapper').each(function() {
                    var eventDate = new Date($.trim($(this).find('.eventDateData').text()));
                    $(this).insertBefore($(this).closest('.BBDesignationSearchResultContainer'));
                    $(this).find('.eventTileMonth').text(BBI.Defaults.monthNames[eventDate.getMonth()]);
                    $(this).find('.eventTileDay').text(eventDate.getDate());
                    if ($.trim($(this).find('.eventUrlData').text()) !== '') {
                        $(this).find('.eventTileLink > a').attr('href', $.trim($(this).find('.eventUrlData').text()));
                    } else {
                        $(this).find('.eventTileLink').hide();
                    }
  
                });
  
                if ($('.internalLanding').length !== 0) {
                    $('.eventTileOuterWrapper').first().parent().rssfeed(BBI.Defaults.newsFeedUrl, {
                        limit: 6,
                        ssl: true,
                        snippet: false,
                        titletag: 'h3',
                        header: false
                    });
                }
            }
  
            if ($('.landingPage .newsTileOuterWrapper').length !== 0) {
                $('.newsTileOuterWrapper').html('').rssfeed(BBI.Defaults.newsFeedUrl, {
                    limit: 4,
                    ssl: true,
                    snippet: false,
                    titletag: 'h3',
                    header: false
                });
            }
  
            if ($('#homePage').not('.foundation').length !== 0) {
                $('#mainContentWrapper .primaryContent').rssfeed(BBI.Defaults.newsFeedUrl, {
                    limit: 6,
                    ssl: true,
                    snippet: false,
                    titletag: 'h3',
                    header: false
                });
            }
  
            if ($('.contentPaneHeader .allEventsButton').length !== 0) {
                $('.allEventsButton[data-control]').on('click', function(e) {
                    var controlSet = $(this).attr('data-control');
                    var newsItems = $('.storyTileOuterWrapper');
                    var eventItems = $('.eventTileOuterWrapper');
                    var button = $(this).not('selected');
                    e.preventDefault();
  
                    if (button.length !== 0) {
                        $('.contentPaneHeader .selected').removeClass('selected');
                        $(this).addClass('selected');
                        if (controlSet === 'news') {
                            newsItems.not('visible').show('slide', 'slow');
                            eventItems.not('visible').hide('slide', 'slow');
                        } else if (controlSet === 'events') {
                            eventItems.not('visible').show('slide', 'slow');
                            newsItems.not('visible').hide('slide', 'slow');
                        } else {
                            newsItems.add(eventItems).not('visible').show('slide', 'slow');
                        }
                    }
                });
            }
  
            if ($('.eventSlider').length !== 0) {
                $('.sliderContent').each(function() {
                    var lineItem = $('<li>');
                    $(this).find('.red a').attr('href', $(this).text()).text('Register');
                    $(this).find('.outline a').attr('href', $(this).text()).text('More Info');
                    lineItem.append($(this));
                    $('.eventSlider').append(lineItem);
                });
  
                $(document).ready(function() {
                    if ($(window).width() <= 768) {
                        $('.eventSlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#newsWrapper .inner').width()),
                            pager: true,
                            controls: false
                        });
                    } else {
                        $('.eventSlider').bxSlider({
                            minSlides: 3,
                            maxSlides: 3,
                            slideWidth: ($('#newsWrapper .inner').width() / 3) - 44,
                            slideMargin: 33,
                            pager: false
                        });
                    }
                });
            }
  
            $(document).ready(function() {
                if ($('.storySlider').length !== 0) {
                    if ($(window).width() <= 768) {
                        $('.storySlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#storiesWrapper .inner').width()),
                            controls: false
                        });
                    } else {
                        $('.storySlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#storiesWrapper .inner').width()),
                            pager: false
                        });
                    }
                }
            });
  
            if ($('.BBDesignationSearchResultContainer .foundationCalendarGridItem').length !== 0) {
                var calendarItems = $('.foundationCalendarGridItem').closest('.BBDesignationSearchResult');
                for (var i = 0; i < calendarItems.length; i += 2) {
                    calendarItems.slice(i, i + 2).wrapAll("<div class='foundationCalendarColumn'></div>");
                }
                BBI.Methods.getImagesFromFolder('Event Tile Images', BBI.Methods.foundationGridImages);
            }
        },
  
        getImagesFromFolder: function(folderPath, callback) {
            var jsonPath = BLACKBAUD.api.pageInformation.rootPath + 'WebApi/Images/' + folderPath;
            $.getJSON(jsonPath, function(data) {
                callback(data);
            });
        },
  
        foundationGridImages: function(imageArray) {
            var imagePos = 0;
            var targets = $('.foundationCalendarGridImage:visible img');
            targets.each(function() {
                $(this).attr('src', imageArray[imagePos].Url);
                imagePos++;
            });
        },
  
        initEventWrapper: function() {
            if ($('.eventWrapper').length !== 0) {
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                $('.eventWrapper').each(function() {
                    var dateString = $(this).find('.hiddenDataFields').text();
                    var eventDate = new Date(dateString);
                    var monthName = monthNames[eventDate.getMonth()];
                    var yearString = eventDate.getFullYear().toString().substring(2);
                    if (eventDate.getDate() === 1) {
                        $(this).find('sup').text('st');
                    } else if (eventDate.getDate() === 2) {
                        $(this).find('sup').text('nd');
                    } else if (eventDate.getDate() === 3) {
                        $(this).find('sup').text('rd');
                    }
                    $(this).find('.hiddenDataFields').hide();
                    $(this).find('.dateItem').text(eventDate.getDate());
                    $(this).find('abbr[title]').text(monthName);
                    $(this).find('.calYear').html('&rsquo;' + yearString);
                });
            }
        },
  
        designationSearchBoxes: function() {
            if ($('.designationInfoBox').length != 0) {
                $('.designationInfoBox').each(function() {
                    var donationLink = $(this).find('hiddenData a').attr('href');
                    var systemID = $(this).find('hiddenData').text();
  
                    $(this).closest('.BBDesignationSearchResult').addClass('designationInfoBoxOuter');
  
                    $(this).find('.designationInfoBoxGiveButton').attr('href', donationLink);
                    $(this).find('.designationInfoBoxInfoButton').attr('href', donationLink);
                });
            }
        },
  
        initADF: function() {
            if ($('#donation-form').length !== 0) {
                //BBI.Methods.renderAmountList(BBI.Defaults.amounts);
  
                //BBI.Methods.renderFunds();
  
                // Remove navigation prompt
                //window.onbeforeunload = null;
  
                // Form-specific variables
                var productName = "Online Donation"; // For ecommerce analytics
                var checkoutDescription = "Commit to UC"; // Appears on Checkout popup. No HTML allowed.
  
                // get domain, for easy switching between environments, if necessary
                var domain =
                    location.protocol +
                    "//" +
                    location.hostname +
                    (location.port ? ":" + location.port : "");
  
                // PartId of external ADF part, to use if donor selects the "can't find your fund" option and submits a description of a fund
                // The integer below is the 'DFJ - Redesigned Giving Form - Donor Specified Fund' part - *MAY BE DIFFERENT BETWEEN PRODUCTION AND STAGING*.
                //var altPartId = 8727;
                var altPartId = 9897; // 5261; // Part ID for alternate confirmation message for donor-specified fund
  
                // Indicator for whether to use altPartId - use if donor selects "can't find your fund" option.
                var useAltPartId = false;
  
                // variables for source code, finder number, category, subcategory, designation, amount, search, and funderTransactionId from URL
                var sourceCode;
                var finderNumber;
                var cat;
                var subcat;
                var des;
                var urlAmount;
                var urlSearch;
                var recurring;
                var hideack;
                var funderTransactionId;
                var urlDesignationGuid;
  
                var myGift = {};
  
                // Array to hold the donation amounts, if applicable.  Radio button inputs for amounts are dynamically created from this array.
                var amtArray = [50, 100, 250, 500, 1000, 1500, 2500, 5000];
  
                // Variables for the attribute GUIDs (add, subtract, rename as necessary)
                var otherDesignationGuid = "7f924538-ac30-4fa0-96c6-e243a2fddb12"; // generic attribute - use for "can't find your fund" functionality
                //var giftTypeGuid = "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb"; // Online Gift Type // commented
                //var donorTypeGuid = "f5c0424e-f97e-438b-a7e5-8201634bb98f"; // Online Gift Donor Type // commented
                var businessNameGuid = "562152e0-b70b-4080-9270-0e9cdc7a8b1e"; // Online Donation - Organization Name // commented
                var repNameGuid = "9f7369d0-a6ca-4faf-bf04-b2e8cc992f1a"; // Online Donation - Organization Representative Name
                var repTitleGuid = "e533e43d-e96c-4277-929f-449d178b3b8c"; // Online Donation - Organization Title
                // var instagramId = "955C9619-67A5-460A-99E6-11CC39E73D1B"; // Instagram social media handle
                // var twitterId = "C0DF4726-8B2D-4D55-BCD2-7C5555CFBB6B"; // Twitter social media handle
                var funderTransactionGuid = "9AD6ADE3-6342-4DC7-AE21-2EDBA8984530"; // Georgia Funder Transaction ID
  
                // global array for designations
                var designationArray = [];
  
                // Set Select2 options
                var select2options = {
                    // width: "element" 
                    width: "100%"
                };

                var select2width = $(".designation-categories").width();
                // console.log(select2width);

                var select2step1options = {
                    width: select2width + "px"
                };
  
                // $('.select2-container').css("width","100%");
  
                // Gift Session class
                var GiftSession = function(
                    paymentMethod,
                    merchantAcct,
                    finderNumber,
                    sourceCode
                ) {
                    // counter for number of gifts currently in session
                    this.giftCount = 0;
  
                    // properties:
                    this.donation = {
                        giftRecurrence: false,
                        giftTribute: false,
                        giftAcknowledgee: false,
  
                        // Donor information
                        Donor: {
                            // Title: $(".donor .title").val(), // No title field
                            FirstName: $(".donor .firstName").val(),
                            LastName: $(".donor .lastName").val(),
                            Address: {
                                StreetAddress: $(".donor .address .streetAddress").val(),
                                City: $(".donor .address .city").val(),
                                State: $(".donor .address .state :selected").text() || $(".donor .address .province").val(),
                                PostalCode: $(".donor .address .postalCode").val(),
                                Country: $(".donor .address .country :selected").text()
                            },
                            EmailAddress: $(".donor .emailAddress").val(),
                            Phone: $(".donor .phone").val(),
                            OrganizationName: $(".donor .organizationName").val()
                        },
                        // Gift information
                        Gift: {
                            Attributes: [{
                                    // Gift Type
                                    AttributeId: "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb",
                                    Value: "One-Time", // "New Gift"
                                    Name: "Gift Type"
                                },
                                {
                                    // Donor type
                                    AttributeId: "f5c0424e-f97e-438b-a7e5-8201634bb98f",
                                    Value: "Individual",
                                    Name: "Donor Type"
                                }
                            ],
                            Designations: [], // designation/amount pairs (a JS object for each... Ex. {Amount: 35, DesignationId: "3439a5c7-9977-4f9c-ba11-fadfb8144d35"}) will be added/removed dynamically when update is run
                            FinderNumber: finderNumber,
                            SourceCode: sourceCode,
                            IsAnonymous: false,
                            IsCorporate: false,
                            PaymentMethod: paymentMethod, // pass this to instance, default to 0.
                            Comments: "",
                            CreateGiftAidDeclaration: false,
                            Recurrence: {
                                Frequency: $(".gift .recurrence .frequency").val(),
                                Month: $(".gift .recurrence .month").val(),
                                DayOfMonth: $(".gift .recurrence .dayOfMonth").val(),
                                StartDate: $(".gift .recurrence .startDate").val(),
                                EndDate: $(".gift .recurrence .endDate").val()
                            },
                            // Tribute information
                            Tribute: {
                                Acknowledgee: {
                                    AddressLines: $(".gift .tribute .acknowledgee .addressLines").val(),
                                    City: $(".gift .tribute .acknowledgee .city").val(),
                                    Country: $(".gift .tribute .acknowledgee .country").val(),
                                    Email: $(".gift .tribute .acknowledgee .email").val(),
                                    FirstName: $(".gift .tribute .acknowledgee .firstName").val(),
                                    LastName: $(".gift .tribute .acknowledgee .lastName").val(),
                                    Phone: $(".gift .tribute .acknowledgee .phone").val(),
                                    PostalCode: $(".gift .tribute .acknowledgee .postalCode").val(),
                                    State: $(".gift .tribute .acknowledgee .state").val()
                                },
                                TributeDefinition: {
                                    FirstName: $(".gift .tribute .tributeDefinition .firstName").val(),
                                    LastName: $(".gift .tribute .tributeDefinition .lastName").val(),
                                    Type: $(".gift .tribute .tributeDefinition .type").val(),
                                    Description: $(".gift .tribute .tributeDefinition .description").val(),
                                    Name: $(".gift .tribute .tributeDefinition .firstName").val() ?
                                        $(".gift .tribute .tributeDefinition .firstName").val() +
                                        " " +
                                        $(".gift .tribute .tributeDefinition .lastName").val() :
                                        $(".gift .tribute .tributeDefinition .lastName").val()
                                },
                                TributeId: null
                            }
                        },
                        PartId: $(".BBDonationApiContainer").data("partid"),
                        Origin: {
                            AppealId: "",
                            PageId: BLACKBAUD.api.pageInformation.pageId,
                            PageName: "Commit to UC Donation Form"
                        },
                        BBSPReturnUri: window.location.href,
                        BBSPTemplateSitePageId: BLACKBAUD.api.pageInformation.pageId,
                        MerchantAccountId: merchantAcct
                    };
                };
  
                /* Begin GiftSession functions */
                GiftSession.prototype.update = function() {
                    // if ($("#recurringGift").prop("checked") == true) {
                    if ($("#giftType").val() == "Monthly") {
                        this.donation.giftRecurrence = true;
                    } else {
                        this.donation.giftRecurrence = false;
                    }
                    if ($(".gift #tributeCheckbox").prop("checked") == true) {
                        this.donation.giftTribute = true;
                    } else {
                        this.donation.giftTribute = false;
                        $(".gift #chkAcknowledge").prop("checked", false);
                        this.donation.giftAcknowledgee = false;
                    }
                    if ($(".gift #chkAcknowledge").prop("checked") == true) {
                        this.donation.giftAcknowledgee = true;
                    } else {
                        this.donation.giftAcknowledgee = false;
                    }
  
                    // Donor data
                    this.donation.Donor = {
                        Title: $(".donor #title").val(), // uncommented
                        FirstName: $(".donor .firstName").val(),
                        LastName: $(".donor .lastName").val(),
                        Address: {
                            StreetAddress: $(".donor .address .streetAddress").val(),
                            City: $(".donor .address .city").val(),
                            State: $(".donor .address .state :selected").text() || $(".donor .address .province").val(),
                            PostalCode: $(".donor .address .postalCode").val(),
                            Country: $(".donor .address .country :selected").text()
                        },
                        EmailAddress: $(".donor .emailAddress").val(),
                        Phone: $(".donor .phone").val(),
                        OrganizationName: $(".donor .organizationName").val()
                    };
  
                    // Gift Attributes, etc.
                    this.donation.Gift.Attributes = [
                        // {
                        //     AttributeId: "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb",
                        //     Value: $(".gift .attributes .giftTypeTxt").val(),
                        //     Name: "Gift Type"
                        // },
                        // {
                        //     AttributeId: "f5c0424e-f97e-438b-a7e5-8201634bb98f",
                        //     Value: $(".gift .attributes .donorTypeTxt").val(),
                        //     Name: "Donor Type"
                        // }
                    ];
  
                    /* if ($(".gift .attributes .donorTypeTxt").val() == "Business") {
                        this.donation.Gift.Attributes.push(
                            {
                                AttributeId: "562152e0-b70b-4080-9270-0e9cdc7a8b1e",
                                Value: $(".gift .attributes .orgNameTxt").val(),
                                Name: "Organization Name"
                            },
                            {
                                AttributeId: "9f7369d0-a6ca-4faf-bf04-b2e8cc992f1a",
                                Value: $(".gift .attributes .orgRepTxt").val(),
                                Name: "Representative Name"
                            },
                            {
                                AttributeId: "e533e43d-e96c-4277-929f-449d178b3b8c",
                                Value: $(".gift .attributes .orgTitleTxt").val(),
                                Name: "Representative Title"
                            }
                        );
                        this.donation.Gift.IsCorporate = true;
                        this.donation.Donor.OrganizationName = $(
                            ".gift .attributes .orgNameTxt"
                        ).val();
                    } else {
                        this.donation.Gift.IsCorporate = false;
                        this.donation.Donor.OrganizationName = null;
                    } */
  
                    // social media handles
                    /*
                    var twitterValue = $("#twitter").val();
                    var instagramValue = $("#instagram").val();
  
                    if (twitterValue) {
                        this.donation.Gift.Attributes.push({
                            AttributeId: twitterId,
                            Value: $("#twitter").val()
                        });
                    }
                    if (instagramValue) {
                        this.donation.Gift.Attributes.push({
                            AttributeId: instagramId,
                            Value: $("#instagram").val()
                        });
                    } */
  
                    if (funderTransactionId) {
                        this.donation.Gift.Attributes.push({
                            AttributeId: funderTransactionGuid,
                            Value: funderTransactionId,
                            Name: "Georgia Funder Transaction ID"
                        });
                    }
  
                    this.donation.Gift.Comments = $(".gift #comments").val();
                    this.donation.Gift.FinderNumber = finderNumber;
                    this.donation.Gift.SourceCode = sourceCode;
  
                    // Gift data
                    // update radio button for 'other' with what's in the input field
                    $(".gift .designations input[name='amount'][id='otherAmount']").val(
                        $(".gift .designations #otherAmountInput").val()
                    );
  
                    // add recurrence info, if "recurring gift" is chosen
                    if (this.donation.giftRecurrence) {
                        this.donation.Gift.Recurrence = {
                            Frequency: $(".gift .recurrence .frequency").val(),
                            Month: $(".gift .recurrence .month").val(),
                            DayOfMonth: $(".gift .recurrence .dayOfMonth").val(),
                            StartDate: $(".gift .recurrence .startDate").val()
                        };
                    } else {
                        this.donation.Gift.Recurrence = null;
                    }
                    if (
                        document.getElementById("endDateCheckbox").checked &&
                        $("#endDate").val() &&
                        this.donation.giftRecurrence
                    ) {
                        this.donation.Gift.Recurrence.EndDate = $(
                            ".gift .recurrence .endDate"
                        ).val();
                    }
  
                    // add tribute info, if tribute checkbox is checked
                    if (this.donation.giftTribute) {
                        this.donation.Gift.Tribute = {};
                        this.donation.Gift.Tribute.TributeDefinition = {
                            FirstName: $(".gift .tribute .tributeDefinition .firstName").val(),
                            LastName: $(".gift .tribute .tributeDefinition .lastName").val(),
                            Type: $(".gift .tribute .tributeDefinition .type").val(),
                            Description: $(".gift .tribute .tributeDefinition .description").val(),
                            Name: $(".gift .tribute .tributeDefinition .firstName").val() ?
                                $(".gift .tribute .tributeDefinition .firstName").val() +
                                " " +
                                $(".gift .tribute .tributeDefinition .lastName").val() :
                                $(".gift .tribute .tributeDefinition .lastName").val()
                        };
  
                        // add acknowledgee info, if acknowledgee checkbox is checked
                        if (this.donation.giftAcknowledgee) {
                            this.donation.Gift.Tribute.Acknowledgee = {
                                FirstName: $(".gift .tribute .acknowledgee .firstName").val(),
                                LastName: $(".gift .tribute .acknowledgee .lastName").val(),
                                Country: $(".gift .tribute .acknowledgee .country :selected").text(),
                                AddressLines: $(".gift .tribute .acknowledgee .addressLines").val(),
                                City: $(".gift .tribute .acknowledgee .city").val(),
                                State: $(".gift .tribute .acknowledgee .state :selected").val(),
                                PostalCode: $(".gift .tribute .acknowledgee .postalCode").val(),
                                Phone: $(".gift .tribute .acknowledgee .phone").val(),
                                Email: $(".gift .tribute .acknowledgee .email").val()
                            };
                        } else {
                            this.donation.Gift.Tribute.Acknowledgee = null;
                        }
                    } else {
                        this.donation.Gift.Tribute = null;
                    }
                    /* Check to see if the donor has used the "Can't find your fund" option.
                    If so, set an attribute with the donor's fund description, 
                    and switch to the alternate part ID, so that the onscreen 
                    and email confirmation text will show the designation as "donor specified." */
                    var desObj = this.donation.Gift.Designations;
                    //console.log(desObj);
  
                    for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                        //console.log(this.donation.Gift.Designations[i].Description);
                        if (
                            typeof this.donation.Gift.Designations[i].Description != "undefined" &&
                            this.donation.Gift.Designations[i].Description.replace(" ", "").length > 1
                        ) {
                            //console.log(desObj[i].Name);
                            this.donation.Gift.Attributes.push({
                                AttributeId: otherDesignationGuid,
                                Value: this.donation.Gift.Designations[i].Description +
                                    " - $" +
                                    this.donation.Gift.Designations[i].Amount
                            });
                            //useAltPartId = true;
                            // specify alternate PartId in gift object - must also be specified in call to Donation API
                            this.donation.PartId = altPartId;
                        } else {
                            this.donation.PartId = $(".BBDonationApiContainer").data("partid");
                        }
                    }
                    //console.log("this.donation...");console.log(this.donation);
                };
  
                GiftSession.prototype.validate = function(step, amt, designation, descr) {
                    //console.log('validate step ' + step);
                    $("#otherAmtInstr").hide();
                    var errs = "";
                    $(".validation-message").remove();
                    if (step == 1) {
                        // step 1 - validation for amount
                        amt = Number(amt);
  
                        if (amt < 1 || isNaN(amt)) {
                            errs += "Gift amount is not valid.<br/>";
                            $(".amounts").after(
                                '<div class="validation-message">Gift amount is not valid.</div>'
                            );
                        }
                        if (!designation || designation == "") {
                            errs += "You must choose a designation.<br/>";
                            $(".designation-select").after(
                                '<div class="validation-message">You must choose a designation.</div>'
                            );
                        }
                        var desDescrCount = 0;
                        for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                            if (this.donation.Gift.Designations[i].Description) {
                                desDescrCount++;
                            }
                        }
                        if (descr.replace(" ", "").length > 0 && desDescrCount > 0) {
                            errs += "Only one alternate fund may be added.";
                            $("#otherDesignation").after(
                                '<div class="validation-message">Only one alternate fund may be added.</div>'
                            );
                        }
                        if (
                            $("#designationId option:selected").attr("data-other") == "true" &&
                            !$("#otherDesignationInput").val()
                        ) {
                            errs += "Please enter a description of the area you'd like to support.";
                            $("#otherDesignation").after(
                                '<div class="validation-message">Please enter a description of the area you\'d like to support.</div>'
                            );
                        }
  
                        /* Validate recurrence info */
                        if (this.donation.giftRecurrence) {
                            if (!this.donation.Gift.Recurrence.StartDate) {
                                errs += "Starting Date is required for recurring gifts.<br />";
                                $(".start-input").after(
                                    '<div class="validation-message">Starting Date is required for recurring gifts.</div>'
                                );
                            }
                            if (this.donation.Gift.Recurrence.Frequency == "select a value") {
                                errs += "Recurrence Frequency required.<br />";
                                $(".frequency-select").after(
                                    '<div class="validation-message">Recurrence Frequency required.</div>'
                                );
                            }
                            if (this.donation.Gift.Recurrence.DayOfMonth == "select a value") {
                                //errs += "Day of Month is required for recurring gifts.<br />";
                            }
                            if (this.donation.Gift.Recurrence.Frequency == 4) {
                                if (this.donation.Gift.Recurrence.Month == "select a value") {
                                    errs += "Month is required for annual recurring gifts.<br />";
                                    $(".month-select").after(
                                        '<div class="validation-message">Month is required for annual recurring gifts.</div>'
                                    );
                                }
                            }
                        }
                    }
  
                    if (step == 2) {
                        // step 2 - validation for recurrence, business, and tribue/acknowledgee info
  
                        var giftType = this.donation.Gift.Attributes.filter(function(obj) {
                            return obj.Name == "Gift Type";
                        })[0];
                        // var donorType = this.donation.Gift.Attributes.filter(function (obj) {
                        //     return obj.Name == "Donor Type";
                        // })[0];
                        var orgName = this.donation.Gift.Attributes.filter(function(obj) {
                            return obj.Name == "Organization Name";
                        })[0];
                        var repName = this.donation.Gift.Attributes.filter(function(obj) {
                            return obj.Name == "Representative Name";
                        })[0];
                        var repTitle = this.donation.Gift.Attributes.filter(function(obj) {
                            return obj.Name == "Representative Title";
                        })[0];
                        var comments = this.donation.Gift.Comments;
  
                        /* Validate gift items */
                        // check for at least one designation/amount
                        if (this.donation.Gift.Designations.length < 1) {
                            errs += "At least one gift (amount and designation) needs to be added before checking out.<br />";
                            $("#lineItems").after(
                                '<div class="validation-message">At least one gift (amount and fund) needs to be added before checking out.</div>'
                            );
                        }
  
                        /* Validate business info */
                        /* if (donorType.Value == "Business") {
                            if (!orgName.Value) {
                                errs += "Business Name is required.<br />";
                                $(".business-name-input").after(
                                    '<div class="validation-message">Business Name is required.</div>'
                                );
                            }
                            if (!repName.Value) {
                                errs += "Representative Name is required.<br />";
                                $(".business-rep-input").after(
                                    '<div class="validation-message">Representative Name is required.</div>'
                                );
                            }
                            if (!repTitle.Value) {
                                errs += "Representative Title is required.<br />";
                                $(".business-title-input").after(
                                    '<div class="validation-message">Representative Title is required.</div>'
                                );
                            }
                            if (!comments) {
                                errs +=
                                    "Please enter your organization's contact information in the special Instructions/Comments area.<br />";
                                $(".comments-input").after(
                                    '<div class="validation-message">Please enter your organization\'s contact information in the special Instructions/Comments area.</div>'
                                );
                            }
                        }*/
  
                        /* Validate tribute info */
                        if (this.donation.giftTribute) {
                            // Honoree
                            /*if(!$("#txtTribute").val()) {
                                errs += "Honoree is required.<br />";
                            }*/
                            // First name
                            /*if(!$("#txtTributeFirstName").val()) {
                                errs += "Honoree first name is required.<br />";
                            }*/
                            // Last name
                            if (!this.donation.Gift.Tribute.TributeDefinition.LastName) {
                                errs += "Honoree last name is required.<br />";
                                $(".tribute-lname-input").append(
                                    '<div class="validation-message">Honoree last name is required.</div>'
                                );
                            }
                            // Type
                            if (this.donation.Gift.Tribute.TributeDefinition.Type == 0) {
                                errs += "Honoree type is required.<br />";
                                $(".tribute-type-input").append(
                                    '<div class="validation-message">Honoree type is required.</div>'
                                );
                            }
                            // Special instructions
                            /*if(!this.donation.Gift.Tribute.TributeDefinition.Description) {
                                errs += "Special instructions/description required.<br />";
                                $(".tribute-instr-input").after('<div class="validation-message">Special instructions/description required.</div>');
                            }*/
                        }
  
                        /* Validate acknowledgee info */
                        if (this.donation.giftAcknowledgee) {
                            // Message recipient (acknowledgee)
                            /*if(!$("#txtTributeAcknFullName").val()) {
                                errs += "Message recipient is required.<br />";
                            }*/
                            // First name
                            /*if(!$("#txtAcknowledgeeFirstName").val()) {
                                errs += "Acknowledgee first name is required.<br />";
                            }*/
                            // Last name
                            if (!this.donation.Gift.Tribute.Acknowledgee.LastName) {
                                errs += "Acknowledgee last name is required.<br />";
                                $(".ackn-lname-input").append(
                                    '<div class="validation-message">Acknowledgee last name is required.</div>'
                                );
                            }
                            // Street address
                            if (!this.donation.Gift.Tribute.Acknowledgee.AddressLines) {
                                errs += "Acknowledgee street address is required.<br />";
                                $(".ackn-address-input").append(
                                    '<div class="validation-message">Acknowledgee street address is required.</div>'
                                );
                            }
                            // City
                            if (!this.donation.Gift.Tribute.Acknowledgee.City) {
                                errs += "Acknowledgee city is required.<br />";
                                $(".ackn-city-input").append(
                                    '<div class="validation-message">Acknowledgee city is required.</div>'
                                );
                            }
                            // ZIP/Postal code
                            if (!this.donation.Gift.Tribute.Acknowledgee.PostalCode) {
                                errs += "Acknowledgee ZIP/Postal code is required.<br />";
                                $(".ackn-zip-input").append(
                                    '<div class="validation-message">Acknowledgee ZIP/Postal code is required.</div>'
                                );
                            }
                            // State
                            if (!this.donation.Gift.Tribute.Acknowledgee.State) {
                                errs += "Acknowledgee state is required.<br />";
                                $(".ackn-state-input").append(
                                    '<div class="validation-message">Acknowledgee state is required.</div>'
                                );
                            }
                            // Country
                            if (!this.donation.Gift.Tribute.Acknowledgee.Country) {
                                errs += "Acknowledgee country is required.<br />";
                                $(".ackn-country-input").append(
                                    '<div class="validation-message">Acknowledgee country is required.</div>'
                                );
                            }
                            //Email Address
                            /*if (!validateEmail(this.donation.Gift.Tribute.Acknowledgee.Email)) {
                                errs += "Acknowledgee email is not valid.<br/>";
                                $(".ackn-email-input").after('<div class="validation-message">Acknowledgee email is not valid.</div>');
                            }*/
                            //Phone
                            /*if (!validatePhone(this.donation.Gift.Tribute.Acknowledgee.Phone)){
                                errs += "Acknowledgee phone is not valid.<br/>";
                                $(".ackn-phone-input").after('<div class="validation-message">Acknowledgee phone number is not valid.</div>');
                            }*/
                        }
                    }
  
                    if (step == 3) {
                        // step 3 - Validate billing info
  
                        var stateValue = document.getElementById("state");
  
                        //Street Address
                        if (!this.donation.Donor.Address.StreetAddress) {
                            errs += "Address is required.<br/>";
                            $(".address-input div").append(
                                '<div class="validation-message">Address is required.</div>'
                            );
                        }
                        //City
                        if (!this.donation.Donor.Address.City) {
                            errs += "City is required.<br/>";
                            $(".city-input div").append(
                                '<div class="validation-message">City is required.</div>'
                            );
                        }
  
                        if (window.getComputedStyle(stateValue).display === "none") {
                            // Province
                            if (!this.donation.Donor.Address.State) {
                                errs += "Province is required.<br/>";
                                $(".province-input div").append(
                                    '<div class="validation-message">Province is required.</div>'
                                );
                            }
                        } else {
                            // State
                            if (!this.donation.Donor.Address.State) {
                                errs += "State is required.<br/>";
                                $(".state-input div").append(
                                    '<div class="validation-message">State is required.</div>'
                                );
                            }
                        }
  
                        //Postal Code
                        if (!this.donation.Donor.Address.PostalCode) {
                            errs += "ZIP/Postal code is required.<br/>";
                            $(".zip-input div").append(
                                '<div class="validation-message">ZIP/Postal code is required.</div>'
                            );
                        }
                        //Country Code
                        if (!this.donation.Donor.Address.Country) {
                            errs += "Country is required.<br/>";
                            $(".country-input div").append(
                                '<div class="validation-message">Country is required.</div>'
                            );
                        }
  
                        //First Name
                        if (!this.donation.Donor.FirstName) {
                            errs += "First name is required.<br/>";
                            $(".fname-input div").append(
                                '<div class="validation-message">First name is required.</div>'
                            );
                        }
                        //Last Name
                        if (!this.donation.Donor.LastName) {
                            errs += "Last name is required.<br/>";
                            $(".lname-input div").append(
                                '<div class="validation-message">Last name is required.</div>'
                            );
                        }
                        //Email Address
                        this.donation.Donor.EmailAddress = this.donation.Donor.EmailAddress.replace(
                            /\s/g,
                            ""
                        );
                        if (!validateEmail(this.donation.Donor.EmailAddress)) {
                            errs += "Email is not valid.<br/>";
                            $(".email-input div").append(
                                '<div class="validation-message">Email is not valid.</div>'
                            );
                        }
                        //Phone
                        if (!validatePhone(this.donation.Donor.Phone)) {
                            errs += "Phone is not valid.<br/>";
                            $(".phone-input div").append(
                                '<div class="validation-message">Phone number is not valid.</div>'
                            );
                        }
                        // check for at least one designation/amount
                        if (this.donation.Gift.Designations.length < 1) {
                            errs +=
                                "At least one gift (amount and designation) needs to be added before checking out.<br />";
                            $(".billingInformation .donor").before(
                                '<div class="validation-message">At least one gift (amount and designation) needs to be added before checking out.</div>'
                            );
                        }
                    }
  
                    if (errs === "") {
                        return true;
                    } else {
                        console.log(errs); //uncommented
                        errs += "<br />";
                        if ($(".validation-message").first()) {
                            $("html, body").animate({
                                    scrollTop: $(".validation-message").first().offset().top - 100
                                },
                                "fast"
                            );
                        } else {
                            $("html, body").animate({
                                    scrollTop: $(".validation").offset().top - 100
                                },
                                "fast"
                            );
                        }
  
                        return false;
                    }
                };
  
                GiftSession.prototype.addLineItem = function(
                    amount,
                    designationId,
                    name,
                    descr
                ) {
                    // push a designation/amount pair object into Designations array; also push Name, so that we have the fund name to display
                    if (this.validate(1, amount, designationId, descr)) {
                        var tempObj = {
                            Amount: amount,
                            DesignationId: designationId,
                            Name: name
                        };
                        if (descr.length > 1) {
                            tempObj.Description = descr;
                            tempObj.Name = descr;
                        }
  
                        //this.donation.Gift.Designations.push({ Amount: amount, DesignationId: designationId, Name: name });
                        this.donation.Gift.Designations.push(tempObj);
                        this.displayLineItems();
                        stepUpdate(this, 2);
                    }
                    this.giftCount = this.donation.Gift.Designations.length;
                    $(".gift-count").text(this.giftCount);
                    this.update();
                };
  
                GiftSession.prototype.removeLineItem = function(arrayIndex) {
                    // remove a designation/amount pair object from Designations array
                    // this.donation.Gift.Designations.splice(arrayIndex, 1); the '1' just means how many items to remove.
                    // We could also use this, or something similar, to remove all line items.
  
                    if (this.donation.Gift.Designations[arrayIndex] !== undefined) {
                        this.donation.Gift.Designations.splice(arrayIndex, 1);
                    }
                    this.displayLineItems();
                    this.giftCount = this.donation.Gift.Designations.length;
                    $(".gift-count").text(this.giftCount);
                    this.update();
                };
  
                GiftSession.prototype.displayLineItems = function() {
                    //$(".lineItems").append("");
                    var giftSession = this;
                    var lineItems = document.getElementById("lineItems");
  
                    if (this.donation.Gift.Designations.length < 1) {
                        lineItems.style.display = "block";
                        $("#lineItems").html(
                            '<div style="text-align:center;"><p>Your gift cart is currently empty.</p><p class="p-1"><a href="#" class="add-gift">+ Add a gift</a></p></div>'
                        );
                        $(".add-gift").on("click", function() {
                            // If a designation is passed in the URL, load that, else load default
                            if (urlSearch) {
                                updateCategories("search");
                                filterDesignations(urlSearch, "search");
                            } else if (des) {
                                updateCategories("search");
                                filterDesignations(des, "search");
                            } else {
                                filterDesignations(
                                    //"Unrestricted",
                                    "99 - Others",
                                    "tag",
                                    "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                                    // "d68341c5-71e8-4362-b8ab-1ecb3b192432"
                                );
                                setCategories("default");
                            }
                            stepUpdate(giftSession, 1);
                        });
                        return;
                    } else {
                        lineItems.innerHTML = "<h3>Gifts</h3>";
                    }
                    var giftTotal = 0;
  
                    for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                        var lineItem = document.createElement("div");
                        lineItem.id = "lineItem" + (i + 1);
                        lineItem.className = "line-item";
  
                        // create amount div
                        var lineItemAmount = document.createElement("div");
                        lineItemAmount.className = "line-item-amount";                
  
                        // check if recurring donation and recurrence option to amount div
                        if (this.donation.giftRecurrence) {
                            var lineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",") +
                                " " +
                                $("#frequency option:selected").text()
                            );
                        } else {
                            var lineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",")
                            );
                        }

                        lineItemAmount.appendChild(lineItemAmountText);
                        lineItem.appendChild(lineItemAmount);
  
                        // create name div
                        var lineItemName = document.createElement("div");
                        lineItemName.className = "line-item-name";
                        var lineItemNameText = document.createTextNode(
                            this.donation.Gift.Designations[i].Name
                        );
                        lineItemName.appendChild(lineItemNameText);
                        lineItem.appendChild(lineItemName);
  
                        // create edit & remove buttons
                        var lineItemButtons = document.createElement("div");
                        lineItemButtons.className = "line-item-buttons";
  
                        /* var lineItemEditButton = document.createElement("a");
                        lineItemEditButton.className = "line-item-edit";
                        lineItemEditButton.setAttribute("data-index", i);
                        var lineItemEditButtonText = document.createTextNode("Edit");
                        lineItemEditButton.appendChild(lineItemEditButtonText);
                        lineItemButtons.appendChild(lineItemEditButton); */
  
                        var lineItemRemoveButton = document.createElement("a");
                        lineItemRemoveButton.className = "line-item-remove";
                        lineItemRemoveButton.setAttribute("data-index", i);
                        var lineItemRemoveButtonText = document.createTextNode("x Remove");
                        lineItemRemoveButton.appendChild(lineItemRemoveButtonText);
                        lineItemButtons.appendChild(lineItemRemoveButton);
                        lineItem.appendChild(lineItemButtons);
  
                        // add line item to line-items section and show section
                        lineItems.appendChild(lineItem);
                        giftTotal += Number(this.donation.Gift.Designations[i].Amount);
  
                        if ($(".payrollDeduction").length !== 0) {
                            $("#totalGift").val("$" + giftTotal.formatMoney(2, ".", ","));
                        } else {
                            // do nothing
                        }
                    }
                    $("#lineItems").append(
                        '<div class="line-item" style="text-align:right;font-size:1.35em;color:#777;line-height:1.8;">Total: $' +
                        giftTotal.formatMoney(2, ".", ",") +
                        "</div>"
                    );
  
                    // Put "add another gift" link at the bottom, which can probably just go to previous step
                    if (
                        // $("#recurringGift").prop("checked") != true &&
                        $("#giftType").val() != "Monthly" &&
                        this.donation.Gift.Designations.length > 0
                    ) {
                        $("#lineItems").append(
                            '<div><a href="#" class="add-gift">+ Add another gift</a></div>'
                        );
                    } else {}
                    $(".add-gift").on("click", function(e) {
                        // If a designation is passed in the URL, load that, else load default
                        e.preventDefault();
                        if (urlSearch) {
                            updateCategories("search");
                            filterDesignations(urlSearch, "search");
                        } else if (des) {
                            updateCategories("search");
                            filterDesignations(des, "search");
                        } else {
                            filterDesignations(
                                //"Unrestricted",
                                "99 - Others", // Unit Attribute\Value column
                                "tag",
                                "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                                //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                            );
                            updateCategories("school");
                            setCategories("default");
                        }
                        stepUpdate(giftSession, 1);
                    });
                    $(".line-item-remove").on("click", function(e) {
                        giftSession.removeLineItem(e.target.getAttribute("data-index"));
                        if (
                            // $("#recurringGift").prop("checked") == true &&
                            $("#giftType").val() == "Monthly" &&
                            myGift.donation.Gift.Designations.length < 1
                        ) {
                            $("#returnToGiftDetail").show();
                        } else {}
                    });
                };
                /* End GiftSession functions */
  
                // Create an instance of the DonationService
                var ds = new BLACKBAUD.api.DonationService(
                        $(".BBDonationApiContainer").data("partid")
                    ),
                    //ClientSitesID = $(".BBDonationApiContainer").attr("ClientSitesID"),
                    CheckoutModel = JSON.parse(checkoutData),
                    serverMonth = $(".BBDonationApiContainer").attr("serverMonth") - 1,
                    serverDay = $(".BBDonationApiContainer").attr("serverDay"),
                    serverYear = $(".BBDonationApiContainer").attr("serverYear"),
                    ServerDate = new Date(serverYear, serverMonth, serverDay);
                InitializeBBCheckout();
  
                // Create our success handler
                var success = function(returnedDonation) {
                    console.log(returnedDonation); // uncommented
                };
  
                // Create our error handler
                var error = function(returnedErrors) {
                    console.log("Error!"); // uncommented
                    setValidationMessage(convertErrorsToHtml(error));
                };
  
                //Checkout Payment popup is loaded in this form.
                if ($('form[data-formtype="bbCheckout"]').length <= 0) {
                    var form =
                        "<form method='get' id=\"paymentForm\" data-formtype='bbCheckout' data-disable-submit='false' novalidate></form>";
                    $("body").append(form);
                }
  
                $("#paymentForm").submit(function paymentComplete(e) {
                    // prevent form from refreshing and show the transaction token
                    e.preventDefault();
                });
                var SrtDt,
                    publicKey,
                    donationData,
                    EditorContent,
                    ServerDate,
                    checkoutGenericError =
                    "There was an error while performing the operation.The page will be refreshed";
  
                // Get data part data and public key for checkout
                getCountries();
                //getDesignations();
  
                var blocked = false; // To block the form from being used while Query API is loading data
  
                // global array for designations
                //var designationArray = [];
  
                //#region CCCheckoutPayment
                //return which payment method is selected on the page
                function GetPaymentType() {
                    paymentMethod = $("[name='paymentMethod']:checked").val();
                    //return paymentMethod;
                    return 0;
                }
  
                // get all URL vars by URL
                function getUrlVars(url) {
                    var vars = [],
                        hash;
                    var hashes = url.slice(url.indexOf("?") + 1).split("&");
                    for (var i = 0; i < hashes.length; i++) {
                        hash = hashes[i].split("=");
                        vars.push(hash[0]);
                        vars[hash[0]] = hash[1];
                    }
                    return vars;
                }
  
                // get a specific URL var by name
                function getURLParameter(name) {
                    return (
                        decodeURIComponent(
                            (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
                                location.search
                            ) || [, ""])[1].replace(/\+/g, "%20")
                        ) || null
                    );
                }
  
                function getUrlValues() {
                    // Get values from URL parameters
                    sourceCode = getURLParameter("sourcecode");
                    finderNumber = getURLParameter("efndnum");
                    cat = getURLParameter("cat");
                    subcat = getURLParameter("subcat");
                    des = getURLParameter("des");
                    urlAmount = getURLParameter("amt");
                    urlSearch = getURLParameter("search");
                    recurring = getURLParameter("recurring");
                    hideack = getURLParameter("hideack");
                    funderTransactionId = getURLParameter("transid");
                    urlDesignationGuid = getURLParameter("id");
  
                    if (urlDesignationGuid && !urlSearch) urlSearch = urlDesignationGuid;
  
                    // Fix for Honors renaming, to make sure old URLs still find the correct funds.
                    /*
                    if (subcat == "honors program" || subcat == "honors") {
                        cat = "school";
                    }
                    if (subcat == "honors program") subcat = "honors";
                    */
  
                    if (recurring) {
                        $("#recurringGift").prop("checked", true);
                        //recurringHandler();
                    }
                    if (hideack) {
                        $("#chkAcknowledge").parent().css("display", "none");
                        $("#acknowledgeeInfoSub").css("display", "none");
                        //recurringHandler();
                    }
                    recurringHandler();
                    if (urlSearch) {
                        updateCategories("search");
                        $("#designationSearch").val(urlSearch);
                        //filterDesignations(urlSearch, "search");  // move to querySuccess function.  Designations not yet loaded here.
                    } else if (des) {
                        updateCategories("search");
                        $("#designationSearch").val(des);
                    }
                    if (urlAmount) {
                        urlAmount = parseFloat(Math.round(urlAmount * 100) / 100).toFixed(2); // restrict to 2 decimal places, for display purposes
                        $("#otherAmtInput").val(urlAmount);
                        $("label.otherAmt").addClass("selected");
                        $("input#otherAmtInput").addClass("selected");
                    }
                }
  
                //this is the function that calls the payment api to open the checkout pop up with all the parameters
                // this.makePayment = function () {
                function makePayment() {
                    //opened = false;
                    //var checkout = new SecureCheckout(handleCheckoutComplete, handleCheckoutError, handleCheckoutCancelled, handleCheckoutLoaded);
                    var donor = data.Donor;
                    var selectedCountry = $("#country :selected").attr("value");
                    var selectedState = $("#state :selected").attr("value");
                    var selectedProvidence = $("#providence :selected").attr("value");
                    if (selectedCountry && selectedCountry.toLowerCase() == "gb") {
                        selectedCountry = "UK";
                    }
                    // get total amount from gift object
                    var totalAmount = 0;
  
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        totalAmount += Number(myGift.donation.Gift.Designations[i].Amount);
                    }
  
                    bbcheckout.Configuration.Data.Amount = totalAmount;
                    bbcheckout.Configuration.Data.BillingAddressCity = donor.Address.City;
                    bbcheckout.Configuration.Data.BillingAddressCountry = selectedCountry;
                    bbcheckout.Configuration.Data.BillingAddressLine = donor.Address.StreetAddress;
                    bbcheckout.Configuration.Data.BillingAddressPostCode = donor.Address.PostalCode;
                    bbcheckout.Configuration.Data.BillingAddressState = selectedState;
                    bbcheckout.Configuration.Data.BillingAddressEmail = donor.EmailAddress;
                    bbcheckout.Configuration.Data.BillingAddressFirstName =
                        donor.FirstName + " " + (donor.MiddleName ? donor.MiddleName : "");
                    bbcheckout.Configuration.Data.BillingAddressLastName = donor.LastName;
                    bbcheckout.Configuration.Data.Cardholder =
                        donor.FirstName + " " + donor.LastName;
                    bbcheckout.Configuration.Data.UseVisaCheckout =
                        data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.Data.UseMasterpass =
                        data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.Data.UseApplePay =
                        data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.TransactionType =
                        bbcheckout.TransactionType.Card_Not_Present;
                    bbcheckout.Configuration.Data.CardToken = null;
                    bbcheckout.Configuration.Data.Note = productName;
                    //bbcheckout.Configuration.Data.Description = checkoutDescription;
  
                    //console.log("donationData...");console.log(donationData);
                    /*if (data.Gift && data.Gift.Recurrence )
                  {
                  bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
      }*/
  
                    //check server date and start date here -- if same then make transaction today
                    if (data.Gift && data.Gift.Recurrence && !isProcessNow()) {
                        bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                        bbcheckout.Configuration.TransactionType =
                            bbcheckout.TransactionType.Store_Card; //Store card transactions
                    } else if (data.Gift && data.Gift.Recurrence) {
                        bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                    }
  
                    //Set Donor Info so that it will be passed to finish the transaction at the end.
                    data.DonationSource = bbcheckout.Configuration.DonationSource.ADF;
                    data.Type = bbcheckout.Configuration.TranType.Donation;
                    bbcheckout.DonorInfo = data;
                    bbcheckout.openCheckout();
                };
  
                function InitializeBBCheckout() {
                    bbcheckout = new BBCheckoutProcessor(
                        checkoutFunctions(),
                        CheckoutModel.APIControllerName,
                        CheckoutModel.TokenId,
                        '[class*="donationForm"]'
                    );
                    //console.log("bbcheckout.Configuration: " + bbcheckout.Configuration);
  
                    bbcheckout.Configuration.Data.Key = CheckoutModel.PublicKey;
                    bbcheckout.Configuration.TransactionType = CheckoutModel.TransactionType;
                    bbcheckout.Configuration.Data.ClientAppName = CheckoutModel.ClientAppName;
                    bbcheckout.Configuration.Data.MerchantAccountId =
                        CheckoutModel.MerchantAccountId;
                    bbcheckout.Configuration.Data.IsEmailRequired = CheckoutModel.IsEmailRequired;
                    bbcheckout.Configuration.Data.IsNameVisible = CheckoutModel.IsNameVisible;
                    bbcheckout.Configuration.Data.PrimaryColor = CheckoutModel.PrimaryColor;
                    bbcheckout.Configuration.Data.SecondaryColor = CheckoutModel.SecondaryColor;
                    bbcheckout.Configuration.Data.FontFamily = CheckoutModel.FontFamily;
                    bbcheckout.Configuration.Data.UseCaptcha = CheckoutModel.UseCaptcha;
                    bbcheckout.Configuration.WorkflowType = CheckoutModel.WorkFlowType;
                    bbcheckout.Configuration.HandleBrowserClosing =
                        CheckoutModel.HandleBrowserClosing === true ? "True" : "False";
                    bbcheckout.Configuration.APITokenID = CheckoutModel.TokenId;
                    // You can add your own message to display on screen, after checkout pop-up close
                    bbcheckout.Configuration.TempConfirmationHtml =
                        "Thank you for your contribution, please wait while we process your transaction.";
                    bbcheckout.intializeCheckout();
  
                    /* Init functions */
                    // create new gift object instance
                    myGift = new GiftSession(0, CheckoutModel.MerchantAccountId);
                    getUrlValues();
                    //recurringHandler();
                    getDesignations();
                }
  
                function checkoutFunctions() {
                    //  If you don't have anything to do then you don't add any events from below mentioned checkoutEvents
                    checkoutEvents = {
                        checkoutComplete: function(e) {
                            //Place any code if you want to do anything on checkout complete.
                            bbcheckout.postCheckoutFinish();
                            submitAnalytics();
                        },
                        checkoutError: function(data) {
                            //Place any code if you want to do anything on error.
                            console.log("checkoutError() called from checkoutFunctions().  Data: ");
                            console.log(data);
                        },
                        checkoutExpired: function() {
                            //Place any code if you want to do anything on Checkout expired.
                            console.log("Checkout expired");
                        },
                        checkoutReady: function() {
                            //Place any code if you want to do anything on Checkout Ready.
                        },
                        browserClose: function() {
                            //Place any code if you want to do anything on Checkout Browser closing.
                        },
                        checkoutCancel: function() {
                            //Place any code if you want to do anything on Checkout cancel.
                        },
                        checkoutLoaded: function() {
                            //Place any code if you want to do anything on Checkout loaded.
                        }
                    };
                    return checkoutEvents;
                }
  
                //to check for recurring gift that is to be processed today or not (this is check for call stored card payment api)
                function isProcessNow() {
                    var recStartDate = data.Gift.Recurrence.StartDate;
                    var frequency = data.Gift.Recurrence.Frequency;
                    var dayOfMonth = data.Gift.Recurrence.DayOfMonth;
                    var month = data.Gift.Recurrence.Month;
                    var startDateIsTodayDate = false;
                    var recurrentStartDate = new Date(recStartDate);
                    var isProcessedNow = false;
                    var serverDate = new Date(ServerDate);
                    if (
                        recurrentStartDate.getFullYear() === serverDate.getFullYear() &&
                        recurrentStartDate.getMonth() === serverDate.getMonth() &&
                        recurrentStartDate.getDate() === serverDate.getDate()
                    ) {
                        startDateIsTodayDate = true;
                    } else {
                        return false;
                    }
  
                    //Weekly Frequency
                    /*if (frequency == 1) {
                            isProcessedNow = startDateIsTodayDate && dayOfWeek == serverDate.getDay();
                        }*/
                    //Mothly and Quarterly frequency
                    //else
                    if (frequency == 2 || frequency == 3) {
                        isProcessedNow = startDateIsTodayDate && dayOfMonth == serverDate.getDate();
                    }
                    //Annually frequency
                    else if (frequency == 4) {
                        isProcessedNow =
                            startDateIsTodayDate &&
                            dayOfMonth == serverDate.getDate() &&
                            month == serverDate.getMonth() + 1;
                    }
                    //Every 4 weeks
                    else if (frequency == 7) {
                        isProcessedNow = startDateIsTodayDate;
                    } else {
                        isProcessedNow = false;
                    }
                    return isProcessedNow;
                }
  
                function sendData() {
                    console.log(bbcheckout.Configuration); // uncommented
                    if (CheckoutModel && CheckoutModel.MACheckoutSupported && GetPaymentType() == 0) {
                        ProcessCCPayment();
                    } else {
                        console.log("send data failed...");
                    }
                }
  
                //use this method for credit card payment through popup
                function ProcessCCPayment() {
                    console.log("donation object");
                    console.log(myGift.donation); // uncommented
                    myGift.donation.MerchantAccountId =
                        bbcheckout.Configuration.Data.MerchantAccountId;
                    myGift.donation.CMSID = bbcheckout.Configuration.Data.CMSID;
                    myGift.donation.TokenId = bbcheckout.Configuration.APITokenID;
  
                    data = myGift.donation;
  
                    // submit "tribute" as placeholder for tribute description, so that the donor can leave it blank
                    if (
                        myGift.donation.Gift.Tribute &&
                        !myGift.donation.Gift.Tribute.TributeDefinition.Description
                    ) {
                        console.log(myGift.donation.Gift.Tribute); // uncommented
                        myGift.donation.Gift.Tribute.TributeDefinition.Description = "tribute";
                    }
  
                    console.log(data); // uncommented
  
                    onValidationSuccess = function(result) {
                        makePayment();
                        return false;
                    };
                    onValidationFailed = function(error) {
                        console.log("onValidationFailed");
                        console.log(error); // uncommented
                        //$(".validation").text(error);
                        setValidationMessage(convertErrorsToHtml(error));
                    };
                    ds.validateDonationRequest(data, onValidationSuccess, onValidationFailed);
                }
  
                /* End Checkout Functions */
  
                // currency format function
                Number.prototype.formatMoney = function(c, d, t) {
                    var n = this,
                        c = isNaN((c = Math.abs(c))) ? 2 : c,
                        d = d == undefined ? "." : d,
                        t = t == undefined ? "," : t,
                        s = n < 0 ? "-" : "",
                        i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + "",
                        j = (j = i.length) > 3 ? j % 3 : 0;
                    return (
                        s +
                        (j ? i.substr(0, j) + t : "") +
                        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
                        (c ?
                            d +
                            Math.abs(n - i)
                            .toFixed(c)
                            .slice(2) :
                            "")
                    );
                };
  
                /* GiftSession moved */
  
                function setCategories(e, subcat) {
                    // SCHOOL OR COLLEGE selected
                    // Arrays of tags to use for filtering designations.  FIRST VALUE IS FOR FILTERING - SECOND VALUE IS DISPLAYED TEXT.
                    // Third value is for default designation.  If included, use this fund as the default choice.
                    var schoolList = [
                        ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                        ["29 - Athletics and UCATS", "Athletics and UCATS"],
                        ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                        ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                        ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                        ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                        ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                        ["06 - College of Law", "College of Law"],
                        ["16 - College of Medicine", "College of Medicine"],
                        ["17 - College of Nursing", "College of Nursing"],
                        ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                        ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                        ["Hoxworth", "Hoxworth"],
                        ["33 - Institute for Policy Research", "Institute for Policy Research"],
                        ["02 - Lindner College of Business", "Lindner College of Business"],
                        ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                        ["28 - UC Alumni Association", "UC Alumni Association"],
                        ["12 - UC Blue Ash College", "UC Blue Ash College"],
                        ["42 - UC Cancer Center", "UC Cancer Center"],
                        ["07 - UC Clermont College", "UC Clermont College"],
                        ["30 - UC Foundation", "UC Foundation"],
                        ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                        ["20 - UC Health", "UC Health"],
                        ["26 - UC Libraries", "UC Libraries"],
                        ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                        /*
                        ["Unrestricted", "University-wide", "D68341C5-71E8-4362-B8AB-1ECB3B192432"],
                        ["Agricultural & Environmental Sciences", "College of Agricultural & Environmental Sciences", "327E1172-7A9D-412B-81B3-0C4B818B4FE7"],
                        ["Art", "Lamar Dodd School of Art", ""],
                        ["Arts & Sciences", "Franklin College of Arts & Sciences", "520B0C18-0C5F-43E6-A423-15EC1C391281"],
                        ["Business", "Terry College of Business", "1BC6F137-A954-4102-BCA1-8A387D9A097F"],
                        ["Ecology", "Odum School of Ecology", "1cb31da6-37ed-4a33-89fc-44d70a44228b"],
                        ["Education", "Mary Frances Early College of Education", "4b88944b-61f9-4677-bdee-f68473b09566"],
                        ["Engineering", "College of Engineering", "ccc1667e-baa4-4c8f-bad8-d0281dfdc489"],
                        ["Environment & Design", "College of Environment & Design", "F14E8564-D235-4987-A77E-1AD5C00F2B35"],
                        ["Family & Consumer Sciences", "College of Family & Consumer Sciences", "6C7806BF-F634-45A1-9F3B-2E82F2461BDD"],
                        ["Forestry & Natural Resources", "Warnell School of Forestry & Natural Resources", "9B2D39CD-E1A0-4CFC-B2F1-7BBF43C0B4E8",
                        ["Graduate School", "Graduate School", ""],
                        ["Honors", "Morehead Honors College", "89589A70-F9DF-492C-887B-ED1375E302E1"],
                        ["Institute of Higher Education", "Louis McBee Institute of Higher Education", "1092c9a2-4b7e-4128-88f2-19fb7608046c"],
                        ["Journalism & Mass Communication", "Grady College of Journalism & Mass Communication", "BB7F6A3B-EE15-403F-BEB5-CA56571E02E5"],
                        ["Law", "School of Law", "26FEA993-C301-4F3D-BFD8-76AB751D4FA0"],
                        ["Music", "Hugh Hodgson School of Music", "369174db-0b6a-45fd-a1d2-e60cee848f98"],
                        ["Pharmacy", "College of Pharmacy", "044F4724-ED3D-4C06-A201-DF1B76405376"],
                        ["Public & International Affairs", "School of Public and International Affairs", "E24C17D4-3A7E-4D7B-9C20-52A88FE54635"],
                        ["Public Health", "College of Public Health", "165856FD-3E2D-4F77-8BD0-D10E59E157DC"],
                        ["Social Work", "School of Social Work", "F9EF229A-1FEC-4D88-8C8B-65F101B10E80"],
                        ["Veterinary Medicine", "College of Veterinary Medicine", "E182BE1A-2CBC-4637-A20C-A845C66F45AE"]
                        */
                    ];
                    var campusList = [
                        // OTHER AREA selected
                        ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                        ["29 - Athletics and UCATS", "Athletics and UCATS"],
                        ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                        ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                        ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                        ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                        ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                        ["06 - College of Law", "College of Law"],
                        ["16 - College of Medicine", "College of Medicine"],
                        ["17 - College of Nursing", "College of Nursing"],
                        ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                        ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                        ["Hoxworth", "Hoxworth"],
                        ["33 - Institute for Policy Research", "Institute for Policy Research"],
                        ["02 - Lindner College of Business", "Lindner College of Business"],
                        ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                        ["28 - UC Alumni Association", "UC Alumni Association"],
                        ["12 - UC Blue Ash College", "UC Blue Ash College"],
                        ["42 - UC Cancer Center", "UC Cancer Center"],
                        ["07 - UC Clermont College", "UC Clermont College"],
                        ["30 - UC Foundation", "UC Foundation"],
                        ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                        ["20 - UC Health", "UC Health"],
                        ["26 - UC Libraries", "UC Libraries"],
                        ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                        /*
                        ["Unrestricted", "University-wide", "D68341C5-71E8-4362-B8AB-1ECB3B192432"],
                        ["Academic Affairs", "Academic Affairs", "69840CF7-C92D-4F62-A688-30AB4EE04179"],
                        //["Alumni Association","Alumni Association","D68341C5-71E8-4362-B8AB-1ECB3B192432"],
                        ["Athletics", "Athletics", "F76EF7B9-FE9F-44DF-BE29-DDE3EC0A496F"],
                        ["Botanical Garden", "Botanical Garden", "E7193632-CBF1-4B28-A287-93256F3E5976"],
                        ["Development and Alumni Relations", "Development and Alumni Relations", ""],
                        ["Finance & Administration", "Finance & Administration", ""],
                        ["GA 4-H", "Georgia 4-H", ""],
                        ["Georgia Museum of Art", "Georgia Museum of Art", "efc92e8a-9522-4057-bbe8-39fe1fe42737"],
                        ["Graduate School", "Graduate School", "B7A97B3E-A487-499D-BE63-02BCBBB029BC"],
                        ["Honors", "Morehead Honors College", "89589A70-F9DF-492C-887B-ED1375E302E1"],
                        ["Institute of Higher Education", "Institute of Higher Education", "1092c9a2-4b7e-4128-88f2-19fb7608046c"],
                        ["Instruction", "Instruction", "B7341668-FBB1-4DEC-804E-34C2245E32F5"],
                        ["International Education", "International Education", "33235df9-cbee-44c2-9cd2-ccd77ca858af"], // previously 31B61FFF-CF0B-4382-8E9F-93D90F5CBB3C
                        ["Libraries", "Libraries", "8BE3F2A9-496D-4647-88FF-34692B1B2F9A"],
                        ["Medical Partnership", "Medical Partnership", "887BD6B1-B4E5-4593-B0E4-504F1B25D266"],
                        ["Performing Arts Center", "Performing Arts Center", "573BE834-8493-40D0-BA69-D8E29EFD71B6"],
                        ["President's Office", "President's Office", "3FCC3C1C-7465-4D8F-BDFE-5EF360EBBFD3"],
                        ["Public Service & Outreach", "Public Service & Outreach", "2DB1D4DD-0EF4-4534-8547-841811F6EAB4"],
                        ["Research", "Research", "50FB55F5-DB73-417A-BA81-CF1D6B708D83"],
                        ["Student Affairs", "Student Affairs", "ab10ed56-b3d9-418a-9352-f3658b7ef3df"],
                        //["University of Georgia","University of Georgia",""],
                        //["Unrestricted","Unrestricted",""],
                        ["WUGA", "WUGA", ""]*/
                    ];
                    var causeList = [
                        ["COVID19 Response", "COVID19 Response", ""],
                        ["Campus-wide Support", "Campus-wide Support", ""],
                        ["Animal Welfare", "Animal Welfare", ""],
                        ["Arts & Humanities", "Arts & Humanities", ""],
                        ["Between the Pages", "Between the Pages", ""],
                        ["Community", "Community", ""],
                        ["Diversity & Inclusion", "Diversity & Inclusion", ""],
                        ["Economic Growth", "Economic Growth", ""],
                        ["Entrepreneurship", "Entrepreneurship", ""],
                        ["Environment", "Environment", ""],
                        ["Experiential Learning", "Experiential Learning", ""],
                        ["Faculty Support", "Faculty Support", ""],
                        ["Food safety & supply", "Food safety & supply", ""],
                        ["Georgia Coast", "Georgia Coast", ""],
                        ["Global Security", "Global Security", ""],
                        ["Health & Wellness", "Health & Wellness", ""],
                        ["Infectious Disease Research", "Infectious Disease Research", ""],
                        ["Leadership Development", "Leadership Development", ""],
                        ["Social Justice", "Social Justice", ""],
                        ["Student Life", "Student Life", ""],
                        ["Student Scholarships", "Student Scholarships", ""],
                        ["Technology", "Technology", ""]
                    ];
  
                    if (e == "default") {
                        var category = "school";
                    } else {
                        if (typeof e == "object") {
                            // event object passed from selector click
                            var category = e.target.id;
                        } else {
                            // category string passed, taken from URL parameter
                            var category = e;
                        }
                    }
                    if (category.toLowerCase() == "otherarea") category = "campus";
                    switch (category) {
                        case "school":
                            selectList = schoolList;
                            break;
                        case "campus":
                            selectList = campusList;
                            break;
                        case "cause":
                            selectList = causeList;
                            break;
                        default:
                            selectList = schoolList;
                            break;
                    }
                    var categorySelector = document.getElementById("categoryList");
                    categorySelector.innerHTML = "";
                    if (category == "cause")
                        $("#categoryList").append(
                            '<option value selected="selected">Make a selection</option>'
                        );
                    for (var i = 0; i < selectList.length; i++) {
                        var opt = document.createElement("option");
                        opt.value = selectList[i][0].toLowerCase().replace(/[\'\"]/g, "");
                        opt.innerHTML = selectList[i][1];
                        opt.setAttribute("data-default", selectList[i][2]);
                        categorySelector.appendChild(opt);
                    }
  
                    // If 'subcat' is passed, mark that category as selected
                    if (subcat) {
                        $(
                            "#categoryList option[value='" +
                            subcat.toLowerCase().replace(/[\'\"]/g, "") +
                            "']"
                        ).attr("selected", "selected");
                    }
                    $("#categoryList").select2(select2step1options);
                }
  
                function filterDesignations(txt, type, def) {
                    // load designations based on category chosen
                    var desArray = [];
                    desArray = designationArray;
                    // console.log(desArray);
                    var desId = document.getElementById("designationId");
                    desId.innerHTML = "";
  
                    // Counter for number of designations found
                    var desCount = 0;
  
                    for (var i = 0; i < desArray.length; i++) {
                        for (var j = 0; j < desArray[i].length; j++) {
                            if (type == "tag") {
                                // Look for exact string match.
                                var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                                comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
  
                                // console.log("desArray[i][j]: " + desArray[i][j]);
                                // Accommodate the tag name change from "Honors Program" to "Honors".  If it's either one, it can match either one.
                                /*
                                if (compTxt == "honors program" || compTxt == "honors")
                                    comp =
                                        "honors" == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "") ||
                                        "honors program" == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
                                */
                            } else {
                                comp = desArray[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;
                            }
                            if (comp) {
                                var opt = document.createElement("option");
                                // opt.value = desArray[i][1];
                                opt.value = desArray[i][6]; // GUID of Designation
                                // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                                // opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                                opt.innerHTML = desArray[i][1]; // Fund Name + Lookup ID
                                opt.setAttribute("data-description", desArray[i][4]); // Designation Description // desArray[i][3]
                                desId.appendChild(opt);
                                desCount++; // add to designation count
                                break;
                            }
                        }
                    }
  
                    var causeSelected = $("#cause").hasClass("selected") == true;
  
                    // append "can't find your fund" option
                    var otherOpt = document.createElement("option");
                    otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                    //"D68341C5-71E8-4362-B8AB-1ECB3B192432"; // submit default designation (Georgia Fund)
                    otherOpt.innerHTML = "Can't find your fund?";
                    if (causeSelected) {
                        otherOpt.setAttribute(
                            "data-description",
                            'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                        );
                    } else {
                        otherOpt.setAttribute(
                            "data-description",
                            "Please enter a brief description of the area you would like to support below."
                        );
                    }
                    otherOpt.setAttribute("data-other", true);
                    desId.appendChild(otherOpt);
  
                    if (desCount == 1) {
                        $("#designationCount").text(" (" + desCount + " result found)");
                        $("#designationId option").first().attr("selected", "selected");
  
                        //$("#designationId").val($("#designationId option:first").val());
                        $("#designationId").val($("#designationId option").first().val());
                    } else {
                        $("#designationCount").text(" (" + desCount + " results found)");
                    }
                    $("#designationCount").show();
  
                    if (def && def.length > 10) {
                        $("#designationId").val(def.toLowerCase());
                    } else {
                        var desId = $("#designationId option:contains('" + def + "')").val();
                        if (desId) $("#designationId").val(desId.toLowerCase());
                    }
  
                    $("#designationId").select2(select2step1options);
                    $("div[id*='designationId']").effect("highlight", {}, 700);
                    setDescription();
                }
  
                function stepUpdate(gift, step) {
                    // remove 'active' class from all except the one passed in 'step' argument
                    $(".validation").html("");
                    $(".designations .amount, #otherAmtInput").removeClass("selected");
                    $("#otherAmtInstr").hide();
                    $(".designations #otherAmtInput").val("");
                    step = Number(step);
  
                    switch (
                        step // conditional handling for different steps
                    ) {
                        case 1:
                            $(".steps").removeClass("active");
                            $(".step" + step).addClass("active");
                            $(".breadcrumb").removeClass("active");
                            $(".bc-designation").addClass("active");
                            $(".breadcrumbs .form-step")
                                .parent().removeClass("complete");
                            if (gift.donation.Gift.Designations.length > 0) {
                                $("#cancelAddLineItem").show();
                            } else {
                                $("#cancelAddLineItem").hide();
                            }
                            $(".breadcrumbs")
                                .removeClass("progress-1")
                                .removeClass("progress-2")
                                .addClass("progress-1");
                            break;
                        case 2:
                            $(".steps").removeClass("active");
                            $(".step" + step).addClass("active");
                            $(".breadcrumb").removeClass("active");
                            $(".bc-review").addClass("active");
                            $(".breadcrumbs .breadcrumb:nth-child(n+1) .form-step")
                                .parent().removeClass("complete");;
                            $(".bc-designation .form-step")
                                .parent().addClass("complete");
                            $(".breadcrumbs")
                                .removeClass("progress-1")
                                .removeClass("progress-3")
                                .addClass("progress-2");
                            break;
                        case 3:
                            if (gift.validate(2)) {
                                $(".steps").removeClass("active");
                                $(".step" + step).addClass("active");
                                $(".breadcrumb").removeClass("active");
                                $(".bc-billing").addClass("active");
                                $(".bc-review .form-step")
                                    .parent().addClass("complete");
                                $(".breadcrumbs")
                                    .removeClass("progress-1")
                                    .removeClass("progress-2")
                                    .addClass("progress-3");
                            } else {}
                            break;
                        default:
                            break;
                    }
                    if (!$(".validation-message").length) {
                        //console.log("no validation message");
                        $("html, body").animate({
                            scrollTop: 0
                        }, 10);
                    }
                }
  
                /* Helper functions */
  
                function renderAmountList(arr) {
                    for (var i = 0; i < arr.length; i++) {
                        $("#amountList").append(
                            '<li><input type="radio" id="amount' +
                            (i + 1) +
                            '" name="amount" class="amount" value="' +
                            amtArray[i] +
                            '" /><label for="amount' +
                            (i + 1) +
                            '">$' +
                            amtArray[i].formatMoney(2) +
                            "</label></li>"
                        );
                    }
                    $("#amountList").append(
                        '<li><input type="radio" id="otherAmount" name="amount" class="amount" value="" /><label for="otherAmount"><input id="otherAmountInput" type="text" placeholder="$" class="BBFormTextbox DonationCaptureTextbox" value=""></label></li>'
                    );
                }
  
                // update other amount value and disable if 'other' radio button is not checked
                function updateAmountInputs() {
                    $("#otherAmount").val($("#otherAmountInput").val());
                    if ($("#otherAmount").prop("checked") == true) {
                        $("#otherAmountInput").prop("disabled", false);
                    } else {
                        $("#otherAmountInput").val("");
                        $("#otherAmountInput").prop("disabled", true);
                    }
                }
  
                function setDescription() {
                    var descr = $("#designationId option:selected").attr("data-description");
                    if (descr && descr.replace(" ", "").length > 0) {
                        $("#desDescrText").text(descr);
                        $("#designationDescription").show().effect("highlight", {}, 700);
                    } else {
                        $("#desDescrText").text("");
                        $("#designationDescription").hide();
                    }
                    if ($("#designationId option:selected").attr("data-other") == "true") {
                        $("#otherDesignation").show();
                    } else {
                        $("#otherDesignation").hide();
                        $("#otherDesignationInput").val("");
                    }
                }
  
                // Set the category button styles and run function(s) to load category tags, etc.
                // (moved from .designation-categories click function)
                function updateCategories(e, subcat) {
                    $(".designation-categories a").removeClass("selected");
  
                    if (typeof e == "object") {
                        var groupId = e.target.id;
                    } else {
                        var groupId = e;
                    }
                    if (groupId.toLowerCase() == "otherarea") groupId = "campus";
                    if (groupId == "") groupId = "search";
                    $(".designation-categories a[id='" + groupId + "']").addClass("selected");
                    if (groupId != "search") setCategories(groupId, subcat);
  
                    switch (groupId) {
                        case "school":
                            $(".designation-search").hide();
                            $(".category-select").show();
                            $("#categoryLabel").html("Which school or college?");
                            break;
                        case "campus":
                            $(".designation-search").hide();
                            $(".category-select").show();
                            $("#categoryLabel").html("Which area?");
                            break;
                        case "cause":
                            $("#categoryLabel").html("Which cause?");
                            $(".category-select").show();
                            $(".designation-search").hide();
                            break;
                        case "search":
                            $(".category-select").hide();
                            $(".designation-search").show();
                            break;
                        default:
                            break;
                    }
                }
  
                // check recurring box when page loads, run recurring handler
                function recurringHandler() {
                    // $(".gift-frequency").removeClass("selected");
                    // $("#recurringGift").addClass("selected");
  
                    // if ($("#recurringGift").prop("checked") == true) {
                    if ($("#giftType").val() == "Monthly") {
                        $("#returnToGiftDetail").hide();
  
                        if ($("#tributeCheckbox").prop("checked") == true) {
                            var conf = confirm(
                                "A recurring gift cannot be made with a tribute. Do you want to change your gift to a recurring gift instead of a tribute?"
                            );
  
                            if (conf == true) {
                                // uncheck and hide tribute section
                                $("#tributeCheckbox").removeAttr("checked");
                                $("#tributeCheckbox").prop("checked", false);
                                $("#tributeInfoSub").hide();
                                $("#returnToGiftDetail").hide();
                            } else {
                                // check "one time gift" and hide recurrence section
                                // $("#recurringGift").prop("checked", false);
                                document.getElementById("giftType").value = "One-Time";
                                //$("#chkAcknowledge").click();
                                $(".gift-frequency").removeClass("selected");
                                $("#oneTimeGift").addClass("selected");
                                $("#recurrenceSection").hide();
                                $("#returnToGiftDetail").show();
                                $("#giftType").parent().show();
                                // $("#giftType").select2(select2options);
                                return;
                            }
                        } else {}
                        $("#recurrenceSection").show();
                        // $("#giftType").parent().hide();
                        // $("#giftType").val("One-Time"); // "New Gift"
                        // $("#giftType").select2(select2options);
                        // $("#frequency").select2(select2options);
  
                        $("#dayOfMonth").parent().hide();
                        if ($("#frequency").val() == 4) {
                            $("#month").parent().show();
                            $("#month").select2(select2options);
                        } else {
                            $("#month").parent().hide();
                        }
                    } else {
                        $("#returnToGiftDetail").show();
                        $("#recurrenceSection").hide();
                        $("#giftType").parent().show();
                        // $("#giftType").select2(select2options);
                    }
  
                    myGift.update();
                    myGift.displayLineItems();
                }
  
                function populateStartDate() {
                    var stDate = $("#startDate").val();
                    // change day of month value
                    var day = moment(stDate, "MM-DD-YYYY").date();
                    $("#dayOfMonth").val(day);
                    $("#dayOfMonth").select2(select2options);
  
                    // if frequency is annual, change month value
                    if ($("#frequency").val() == 4) {
                        var month = moment(stDate, "MM-DD-YYYY").month();
                        $("#month").val(month + 1);
                        $("#month").select2(select2options);
                    }
                }
  
                // Compare function to sort designationArray by titles
                function compareDesignationLabels(a, b) {
                    var aLabel = removeArticles(a[0].toLowerCase()),
                        bLabel = removeArticles(b[0].toLowerCase());
  
                    if (aLabel < bLabel) {
                        return -1;
                    }
                    if (aLabel > bLabel) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                }
  
                function compare(a, b) {
                    if (a[0].replace('"', "") < b[0].replace('"', "")) return -1;
                    if (a[0].replace('"', "") > b[0].replace('"', "")) return 1;
                    return 0;
                }
  
                function removeArticles(str) {
                    words = str.split(" ");
                    if (words.length <= 1) return str;
                    if (words[0] == "a" || words[0] == "the" || words[0] == "an")
                        return words.splice(1).join(" ");
                    return str;
                }
  
                function submitAnalytics() {
                    // Google Analytics
                    // add split amounts
                    var total = 0;
                    var desString = "";
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        total += Number(myGift.donation.Gift.Designations[i].Amount);
  
                        // Create the designation string
                        if (i >= 1) {
                            desString +=
                                ", " +
                                myGift.donation.Gift.Designations[i].Name +
                                " ($" +
                                Number(myGift.donation.Gift.Designations[i].Amount).toFixed(2) +
                                ")";
                        } else {
                            desString +=
                                myGift.donation.Gift.Designations[i].Name +
                                " ($" +
                                Number(myGift.donation.Gift.Designations[i].Amount).toFixed(2) +
                                ")";
                        }
                    }
  
                    // GA4/GTM data layer
                    var gaItems = [];
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        gaItems.push({
                            item_id: myGift.donation.Gift.Designations[i].DesignationId,
                            item_name: myGift.donation.Gift.Designations[i].Name,
                            item_category: productName,
                            price: myGift.donation.Gift.Designations[i].Amount,
                            quantity: 1
                        });
                    }
  
                    dataLayer.push({
                        ecommerce: null
                    }); // Clear the previous ecommerce object.
                    dataLayer.push({
                        event: "purchase",
                        ecommerce: {
                            transaction_id: myGift.donation.TokenId,
                            value: total,
                            currency: "USD",
                            items: gaItems
                        }
                    });
                    // End GA4/GTM data layer
  
                    // add transaction
                    ga("ecommerce:addTransaction", {
                        id: myGift.donation.TokenId,
                        affiliation: "",
                        revenue: total,
                        shipping: "",
                        tax: ""
                    });
  
                    // add items
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        ga("ecommerce:addItem", {
                            id: myGift.donation.TokenId,
                            name: productName,
                            sku: myGift.donation.Gift.Designations[i].Name +
                                " ($" +
                                Number(myGift.donation.Gift.Designations[i].Amount).toFixed(2) +
                                ")",
                            category: productName,
                            price: myGift.donation.Gift.Designations[i].Amount,
                            quantity: 1
                        });
                    }
                    ga("ecommerce:send");
                    ga("ecommerce:clear");
                    // end google analytics
  
                    //console.log(total.toFixed(2));
                    // Disable FB tracking for testing purposes.  Add the following code back whe going live.
                    //fbq('track', 'Purchase', { value: total, currency: 'USD' });
                    //fbq('trackCustom', 'MyCustomEvent', { myParam: '' });
  
                    // Match360 / Double the Donation code
                    if (window.doublethedonation) {
                        // Don't break your page if our plugin doesn't load for any reason
                        var doublethedonation_company_id = $(
                            "input[name='doublethedonation_company_id']"
                        ).val();
                        var doublethedonation_status = $(
                            "input[name='doublethedonation_status']"
                        ).val();
                        var doublethedonation_entered_text = $(
                            "input[name='doublethedonation_entered_text']"
                        ).val();
                        var match360Object = {
                            "360matchpro_public_key": "N6tBG3KcsjhTlVVR", //Replace this key with your 360MatchPro public key
                            campaign: "Online Donation",
                            donation_identifier: myGift.donation.TokenId,
                            donation_amount: total,
                            donor_first_name: myGift.donation.Donor.FirstName,
                            donor_last_name: myGift.donation.Donor.LastName,
                            donor_email: myGift.donation.Donor.EmailAddress,
                            donor_address: {
                                zip: myGift.donation.Donor.Address.PostalCode, //numeric, but string (eg. "30301", "30101-123") will work
                                city: myGift.donation.Donor.Address.City,
                                state: myGift.donation.Donor.Address.State,
                                address1: myGift.donation.Donor.Address.StreetAddress,
                                //"address2": returnedGiftInfo.Donor.Address.,
                                country: myGift.donation.Donor.Address.Country
                            }, //ISO 3166-1 alpha-2 country code (eg. "US", "CA", "GB")
                            donor_phone: myGift.donation.Donor.Phone, //This is an example. Your phone number can be formatted differently.
                            donation_datetime: moment().format("YYYY-MM-DDTHH:mm:ss.SSS"), //"2018-12-25T10:15:30-05:00",
                            doublethedonation_company_id: doublethedonation_company_id, // only needed if using streamlined search
                            doublethedonation_status: doublethedonation_status, // only needed if using streamlined search
                            doublethedonation_entered_text: doublethedonation_entered_text // only needed if streamlined search used on donation page
                        };
                        //console.log(match360Object);
                        //if (doublethedonation_entered_text.replace(' ','').length >= 1) { // Only send if a value was entered.
                        doublethedonation.integrations.core.register_donation(match360Object);
                        //}
                    }
                }
  
                function getCountries() {
                    var selectCountry = $("#country");
                    var selectAcknowledgeeCountry = $("#acknowledgeeCountry");
                    var service = new BLACKBAUD.api.CountryService();
                    var usVal = "";
  
                    // Load Countries
                    service.getCountries(function(countries) {
                        for (var i = 0, j = countries.length; i < j; i++) {
                            if (countries[i].Description == "United States") {
                                selectCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" selected="selected" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                selectAcknowledgeeCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" selected="selected" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                usVal = countries[i].Id;
                                // console.log('usVal: ' + usVal);
                            } else {
                                selectCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                selectAcknowledgeeCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                            }
                        }
                        getStates(usVal, $("#state"));
                        getStates(usVal, $("#province"));
                        getStates(usVal, $("#acknowledgeeState"));
                        $("#country").select2(select2options);
                        $("#acknowledgeeCountry").select2(select2options);
                    });
  
                    // Watch Countries Change
                    $("#country").on("change", function() {
                        var selectedCountry = $(this).find("option:selected").attr("data-guid");
                        console.log($(this).val());
                        if ($(this).val() == "US") {
                            // Load States
                            $(".state-input").removeClass("hide");
                            $(".province-input").addClass("hide");
                        } else {
                            $(".state-input").addClass("hide");
                            $(".province-input").removeClass("hide");
                            getStates(selectedCountry, $("#province")); // #state
                        }
  
                        //myGift.update();
                    });
  
                    $("#acknowledgeeCountry").on("change", function() {
                        var selectedCountry = $(this).find("option:selected").attr("data-guid");
  
                        // Load States
                        getStates(selectedCountry, $("#acknowledgeeState"));
                    });
                }
  
                function getStates(country, selectState) {
                    var service = new BLACKBAUD.api.CountryService();
  
                    // Load States
                    service.getStates(country, function(states) {
                        selectState.html("");
                        for (var i = 0, j = states.length; i < j; i++) {
                            if (states[i].Description == "Ohio") {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '" selected="selected">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            } else if (states[i].Description == "N/A") {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '" selected="selected">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            } else {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            }
                        }
                        selectState.select2(select2options);
                        //if (myGift) myGift.update();
                        if (myGift && "update" in myGift) myGift.update();
                    });
                }
  
                function getDesignations() {
                    // See about putting everything in here instead of initializing the Query API in the form setup.
                    // Maybe pass the Query ID instead of hard-coding it inside the function.
                    blockForm($(".donationForm"));
  
                    var queryInstanceId = "4146d3c8-c678-4b1a-9a23-1c163c05b39f"; // "b0e28c08-4081-4328-91f5-8509243f5d79";
                    //"aa7bb498-5129-4ec5-ac1b-9fd9e560449d"; // BBIS - Find a Fund Designations - Abridged
                    var queryOptions = {
                        crossDomain: false
                    };
                    var filters = [];
                    var queryService = new BLACKBAUD.api.QueryService(queryOptions);
  
                    querySuccess = function(obj) {
                        designationArray = [];
                        for (var i = 0; i < obj.Rows.length; i++) {
                            var tempArray = [
                                obj.Rows[i].Values[0],
                                obj.Rows[i].Values[1],
                                obj.Rows[i].Values[2],
                                obj.Rows[i].Values[3],
                                obj.Rows[i].Values[4],
  
                                obj.Rows[i].Values[5],
                                obj.Rows[i].Values[6],
                                obj.Rows[i].Values[7],
                                obj.Rows[i].Values[8],
                                obj.Rows[i].Values[9]
                            ];
  
                            if (i > 1 && obj.Rows[i].Values[0] == obj.Rows[i - 1].Values[0]) {
                                designationArray[designationArray.length - 1].push(obj.Rows[i].Values[4]);
                            } else {
                                designationArray.push(tempArray);
                            }
                        }
  
                        // sort array results and remove duplicates
                        var sortedArray = designationArray.sort(compare);
                        var tidiedArray = [];
  
                        /* alternate designation process:
                        - create second array (tidiedArray)
                        - loop through first array and
                        -- push funds that aren't already in the array
                        -- if they are already in the array, push the tag */
                        for (var i = 0; i < sortedArray.length; i++) {
                            if (tidiedArray.indexOf(sortedArray[i]) < 0) {
                                tidiedArray.push(sortedArray[i]);
                            }
                        }
  
                        for (var i = 0; i < sortedArray.length - 1; i++) {
                            // need a way to check more than just the next, or previous, fund
                            // for each fund, loop through the upcoming funds until the name does NOT match the current name - grab and push the tags and delete the funds
  
                            if (sortedArray[i][0] == sortedArray[i + 1][0]) {
                                sortedArray[i + 1].push(sortedArray[i][3]);
                                sortedArray.splice(i, 1);
                            }
                        }
                        designationArray = sortedArray;
  
                        // Generate option elements for designation selectors, based on designationArray
                        for (var i = 0; i < designationArray.length; i++) {
                            var otherDes = document.getElementById("designationId");
                            var otherOpt = document.createElement("option");
                            otherOpt.value = designationArray[i][1];
                            otherOpt.innerHTML =
                                designationArray[i][0] + " - " + designationArray[i][2];
                            otherOpt.setAttribute("data-description", designationArray[i][4]);
                            otherDes.appendChild(otherOpt);
                        }
                        if (subcat) {
                            // *** add des filter.  It should fail gracefully, if fund isn't found...
                            updateCategories(cat, subcat);
                            setCategories(cat, subcat);
                            if (des) {
                                filterDesignations(subcat, "tag", des);
                            } else {
                                var def = $(
                                    "#categoryList option[value='" +
                                    subcat.toLowerCase().replace(/[\'\"]/g, "") +
                                    "']"
                                ).attr("data-default");
                                filterDesignations(subcat, "tag", def);
                            }
                        } else if (des) {
                            setCategories("default");
                            filterDesignations(des, "search", des);
                        } else if (urlSearch) {
                            setCategories("default");
                            filterDesignations(urlSearch, "search");
                        } else if (cat) {
                            // This should be run if a category is sent, but no subcategory.  Should work for all four categories.
                            updateCategories(cat);
                            setCategories(cat);
                        } else {
                            setCategories("default");
                            filterDesignations(
                                //"Unrestricted",
                                "99 - Others", // Unit Attribute\Value column
                                "tag",
                                "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                                //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                            );
                        }
                        $("#designationId").select2(select2step1options);
                        unblockForm($(".donationForm"));
                    };
                    queryFailure = function(obj) {
                        unblockForm($(".donationForm"));
                    };
                    var queryResults = queryService.getResults(
                        queryInstanceId,
                        querySuccess,
                        queryFailure,
                        filters
                    );
                }
  
                function setValidationMessage(html) {
                    //console.log("setValidationMessage");
                    $(".validation").html(html);
                    $("html, body").animate({
                            scrollTop: $(".validation").offset().top - 200
                        },
                        "fast"
                    );
                }
  
                function convertErrorToString(error) {
                    /*  Possible errors - might help to have cases for all:
                    
                        RecordNotFound (106)
                        RequiredFieldMissing (101)
                        InvalidFieldSupplied (102)
                        ValueBelowMinimum (103)
                        ValueExceedsMaximum (104)
                        ValueNotAllowed (105)
                        ExceedsMaximumLength (107)*/
  
                    if (error) {
                        if (error.Message) return error.Message;
                        switch (error.ErrorCode) {
                            case 101:
                                return error.Field + " is required.";
                            case 102:
                                return error.Field + " is not valid.";
                            case 103:
                                return error.Field + " is below the minimum required.";
                            case 104:
                                return error.Field + " is above the maximum value.";
                            case 105:
                                return error.Field + " is not valid.";
                            case 106:
                                return "Record for " + error.Field + " was not found.";
                            case 107:
                                return error.Field + " exceeds the maximum character length.";
                            case 203:
                                var url =
                                    location.protocol +
                                    "//" +
                                    location.hostname +
                                    (location.port ? ":" + location.port : "") +
                                    location.pathname;
                                return (
                                    '<p>The donation was not completed. Click the link below to return to the donation form:</p><p><a href="' +
                                    url +
                                    '">' +
                                    url +
                                    "</a></p>"
                                );
                            default:
                                return "Error code " + error.ErrorCode + ".";
                        }
                    }
                }
  
                function convertErrorsToHtml(errors) {
                    var i,
                        message = "Unknown error.<br/>";
                    if (errors) {
                        message = "";
                        for (i = 0; i < errors.length; i++) {
                            message = message + convertErrorToString(errors[i]) + "<br/>";
                        }
                    }
                    return message;
                }
  
                function validateEmail(email) {
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }
  
                function validatePhone(phone) {
                    if (phone) {
                        var re = /^[0-9 \+\)\(\-]{6,20}\s?((([xX]|[eE][xX][tT])\.?\s*(\d+))*)$/;
                        return re.test(phone);
                    } else {
                        return false; // Was 'return true'. Changed to 'return false' to get it to work.
                    }
                }
  
                function blockForm(element) {
                    if (!blocked) {
                        BLACKBAUD.api.blockElement(element);
                        blocked = true;
                    }
                }
  
                function unblockForm(element) {
                    BLACKBAUD.api.unblockElement(element);
                    blocked = false;
                }
                /* End helper functions */
  
                /* Set up form */
  
                // Attach our event listener to the donate button
                $(".btn-donate").click(function(e) {
                    // Stop the button from submitting the form
                    e.preventDefault();
                    setValidationMessage("");
  
                    if (myGift.validate(3)) {
                        sendData();
  
                        // BBI.Methods.getDonationData();
                    }
                });
  
                $(".designation-categories a").on("click", function(e) {
                    e.preventDefault();
                    updateCategories(e);
                });
  
                $("#designationSearch").on("keyup", function(e) {
                    var txt = $(this).val();
                    if (e.which == 13) {
                        e.preventDefault();
                        if (txt != "") filterDesignations(txt, "search");
                    }
                });
  
                $("#designationSearchBtn").on("click", function(e) {
                    var txt = $("#designationSearch").val();
                    e.preventDefault();
                    if (txt != "") filterDesignations(txt, "search");
                });
  
                // when designation selector changes, run function to set description
                $(".designations").on("change", function(e) {
                    setDescription();
                    $(".validation-message").remove();
                });
  
                $(".amounts a, .amounts .otherAmt").on("click", function(e) {
                    e.preventDefault();
                    $(".amounts a, .amounts .otherAmt, .amounts input").removeClass("selected");
                    $(this).addClass("selected");
  
                    // if it's 'other', add 'selected' class to input and give that input focus
                    if ($(this).hasClass("otherAmt")) {
                        $(this).find("> input").addClass("selected").focus().select();
                        $("#otherAmtInstr").show();
                        $(".validation-message").hide();
                    } else {
                        $(".amounts #otherAmtInput").val($(this).attr("data-value"));
                        $("#otherAmtInstr").hide();
                    }
                });
  
                $(".gift-count-indicator").on("click", function() {
                    if (parseInt($(".gift-count").text()) > 0) {
                        stepUpdate(myGift, 2);
                    } else {}
                });
  
                $("#cancelAddLineItem").on("click", function() {
                    stepUpdate(myGift, 2);
                });
  
                $("#continueToYourInfo").on("click", function() {
                    stepUpdate(myGift, 3);
                });
  
                $("#returnToGiftDetail, .add-gift").on("click", function() {
                    // If a designation is passed in the URL, load that, else load default
                    if (urlSearch) {
                        updateCategories("search");
                        filterDesignations(urlSearch, "search");
                    } else if (des) {
                        updateCategories("search");
                        filterDesignations(des, "search");
                    } else {
                        setCategories("default");
                        filterDesignations(
                            //"Unrestricted",
                            "99 - Others",
                            "tag",
                            "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                            //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                        );
                    }
                    stepUpdate(myGift, 1);
                });
  
                $(".add-gift").on("click", function() {
                    // If a designation is passed in the URL, load that, else load default
                    if (urlSearch) {
                        filterDesignations(urlSearch, "search");
                    } else if (des) {
                        filterDesignations(des, "search");
                    } else {
                        setCategories("default");
                        updateCategories("school");
                        filterDesignations(
                            //"Unrestricted",
                            "99 - Others",
                            "tag",
                            "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                            //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                        );
                    }
                    stepUpdate(myGift, 1);
                });
  
                $("#returnToReview").on("click", function() {
                    stepUpdate(myGift, 2);
                });
  
                $(".breadcrumbs a").on("click", function(e) {
                    e.preventDefault();
                    stepUpdate(myGift, $(this).attr("data-step"));
                });
  
                $("#categoryList").select2(select2step1options);
                $("#categoryList").change(function() {
                    filterDesignations(
                        $(this).val(),
                        "tag",
                        $("#categoryList option:selected").attr("data-default")
                    );
                });
  
                $(".donationForm").change(function() { // ".form"
                    myGift.update();
                });
  
                $(".addLineItem").click(function() {
                    var id = $(".designations .designationId option:selected").val();
                    var name = $(".designations .designationId option:selected").text();
                    var descr = "";
                    var amount = 0;
                    if ($(".designations #otherAmtInput").hasClass("selected")) {
                        amount = $(".designations #otherAmtInput").val();
                        amount = amount.toString();
                        amount = amount.replace(/[,$]+/g, "");
                        amount = parseFloat(amount);
                    } else {
                        amount = $(".designations .amount.selected").attr("data-value");
                    }
  
                    if ($("#designationId option:selected").attr("data-other") == "true") {
                        descr = $("#otherDesignationInput").val();
                    } else {
                        descr = "";
                    }
                    myGift.addLineItem(amount, id, name, descr);
                });
  
                // Create amount inputs from amtArray (top of code)
                renderAmountList(amtArray);
                $("input[name='amount']:first").prop("checked", true);
  
                let urlAmountValue = getURLParameter("amt");
                if (urlAmountValue) {
                    console.log(urlAmountValue);
                } else {
                    // Set initial amount on form
                    // $(".amounts .amount[data-value='100']").addClass("selected");
                    // $("#otherAmtInput").val("100");
                }
  
                // run function to update amount inputs if radio buttons and/or other amount input change
                $("input[name='amount']").change(function() {
                    updateAmountInputs();
                });
                $("#otherAmountInput").blur(function() {
                    updateAmountInputs();
                });
                updateAmountInputs();
  
                // $("#recurringGift").on("change", function (e) {
                $("#giftType").on("change", function(e) {
                    recurringHandler();
                });
  
                $("#frequency").change(function() {
                    if ($("#frequency").val() == 4) {
                        $("#month").parent().show();
                        $("#month").select2(select2options);
                    } else {
                        $("#month").parent().hide();
                    }
                });
  
                // Number of Installments scripts
                $(document).on("change keyup", "#numberOfInstallments", function() {
                    var numberOfInstallments = $(this).val(),
                        n1 = $("#totalGift").val(),
                        n2 = $("#numberOfInstallments").val(),
                        regp = /[^0-9.-]+/g,
                        formatter = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        });
                    console.log(numberOfInstallments);
  
                    var installmentAmount = parseFloat(n1.replace(regp, '')) / parseFloat(n2.replace(regp, ''));
                    installmentAmount = parseFloat(installmentAmount, 10).toFixed(2);
                    $("#installmentAmount").val(formatter.format(installmentAmount));
                });
  
                // auto populate start date
                $("#startDate").val(moment().format("MM/DD/YYYY"));
                populateStartDate();
  
                // auto-populate day/month based on start date
                $("#startDate").change(function() {
                    populateStartDate();
                });
  
                // toggle end date field
                $("#endDateCheckbox").on("change", function(e) {
                    if (this.checked == true) {
                        $("#endDate").show();
                    } else {
                        $("#endDate").hide();
                    }
                });
  
                // hide/show business section
                /*
                $("#donorType").change(function () {
                    $(".validation-message").remove();
                    if ($(this).val() == "Business") {
                        $("#businessSection").show();
                        $(".comments-input").append(
                            '<div id="commentInstr" class="input-helper">Please enter your organization\'s contact information in the Special Instructions/Comments area above.</div>'
                        ); // append instructions to comment field
                    } else {
                        $("#businessSection").hide();
                        $("#commentInstr").remove();
                    }
                });*/
  
                $(function() {
                    var d = new Date(),
                        day = d.getDate();
  
                    function getMinDate() {
                        var date = new Date();
                        if (day > 15) {
                            date.setMonth(date.getMonth() + 1, 1);
                        } else if (day == 1) {
                            // set to current date
                        } else {
                            date.setDate(15);
                        }
                        return date;
                    }
  
                    $("#startDate, #endDate").attr("readOnly", "true");
                    $("#startDate").datepicker({
                        beforeShowDay: function(dt) {
                            return [
                                dt.getDate() == 1 || dt.getDate() == 15 ?
                                true :
                                false,
                            ];
                        },
                        minDate: getMinDate()
                        // minDate: -0,
                        // changeMonth: true,
                        // changeYear: true 
                        /*,
                            showOn: "button",
                            buttonImage: "images/calendar.gif",
                            buttonImageOnly: true,
                            buttonText: "Select date"*/
                    });
                    $("#startDate").datepicker("setDate", getMinDate());
                    $("#endDate").datepicker({
                        minDate: -0,
                        changeMonth: true,
                        changeYear: true
                        /*,
                                             showOn: "button",
                                             buttonImage: "images/calendar.gif",
                                             buttonImageOnly: true,
                                             buttonText: "Select date"*/
                    });
                });
  
                // Set tribute/acknowledgee subsections to hidden initially
                $("#tributeInfoSub").hide();
                $("#acknowledgeeInfoSub").hide();
  
                // Event handlers for tribute/acknowledgee checkboxes
                $("#tributeCheckbox").change(function() {
                    if (this.checked) {
                        $("#tributeInfoSub").show();
                        // $("#ddlTribute").select2(select2options);
                        // if (!$("#chkAcknowledge").attr("checked") && !hideack)
                        // $("#chkAcknowledge").click();
                    } else {
                        $("#tributeCheckbox").prop("checked", false);
                        $("#tributeInfoSub").hide();
                        $("#acknowledgeeInfoSub").hide();
                    }
                });
  
                $("#chkAcknowledge").change(function() {
                    if (this.checked) {
                        $("#acknowledgeeInfoSub").show();
                        $("#acknowledgeeCountry").select2(select2options);
                        $("#acknowledgeeState option[value='OH']").attr("selected", "selected");
                        $("#acknowledgeeState").select2(select2options);
                    } else {
                        $("#acknowledgeeInfoSub").hide();
                    }
                });
  
                // $("#giftType").select2(select2options);
                // $("#donorType").select2(select2options);
  
                $("#tributeCheckbox").change(function() {
                    if (
                        $(this).prop("checked") == true &&
                        $("#giftType").val() == "Monthly"
                        // $("#recurringGift").prop("checked") == true
                    ) {
                        var conf = confirm(
                            "A tribute cannot be made with a recurring gift.  Do you want to change your gift to a tribute instead of a recurring gift?"
                        );
  
                        if (conf == true) {
                            // change to one-time gift and hide recurrence section
                            if (!hideack) $("#chkAcknowledge").click();
                            $(".gift-frequency").removeClass("selected");
                            document.getElementById("giftType").value = "One-Time";
                            // $("#recurringGift").prop("checked", false);
                            myGift.update();
                            $("#recurrenceSection").hide();
                            $("#returnToGiftDetail").show();
                            $("#giftType").parent().show();
                            // $("#giftType").select2(select2options);
                        } else {
                            // uncheck tribute checkbox and hide tribute section
                            $("#tributeCheckbox").removeAttr("checked");
                            $("#tributeCheckbox").prop("checked", false);
                            $("#returnToGiftDetail").hide();
                            $("#tributeInfoSub").hide();
                            return;
                        }
                    }
                    myGift.displayLineItems();
                });
  
                $(".tributeDefinition .type").change(function() {
                    var typeTxt = $(this).val();
                    if (typeTxt.indexOf("pet") >= 0) {
                        $(".tributeDefinition .firstName").val("");
                        $(".tributeDefinition .tribute-fname-input").hide();
                        $(".tributeDefinition .tribute-lname-label").text("Pet's name:");
                    } else {
                        $(".tributeDefinition .tribute-fname-input").show();
                        $(".tributeDefinition .tribute-lname-label").text("Last name:");
                    }
                });
  
                /* end setup */
            }
            if ($('#advancedDonationForm').length !== 0) {
  
                setTimeout(function() {
                    //highlight query param amount
                    $('.amountButton a').each(function() {
                        var currentButtonText = $(this).html();
                        if (currentButtonText.charAt(0) === '$') {
                            currentButtonText = currentButtonText.slice(1);
                            // console.log("currentButtonText= " + currentButtonText);
                        }
                        if (BBI.Methods.getUrlVars().amount == currentButtonText) {
                            $(this).addClass('selected');
                            $('#txtAmount').css('color', 'transparent');
                        }
                    });
                }, 300);
  
                //init the tabs
                BBI.Methods.initAdfTabs();
  
                //date pickers
                $('#startDate').datepicker();
                $('#endDate').datepicker({
                    changeMonth: true,
                    changeYear: true
                });
  
                //enter default 'greatest need' designation
                $('#designationId').val(BBI.Defaults.greatestNeedFund);
                $('.designationButton').first().find('a').attr('rel', BBI.Defaults.greatestNeedFund);
  
                //highlight clicked amounts
                $('.amountButton a').on('click', function() {
                    //highlight clicked amounts
                    $('.amountButton .selected').removeClass('selected');
                    $(this).addClass('selected');
                    $('#txtAmount').val($(this).attr('rel'));
                    $('#txtAmount').hide();
                    $('#adfOtherLabel').show();
                    $('.giftAmountError').remove();
  
                    //update display
                    var amount = $('.amountButton a.selected').attr('rel');
                    $('.adfTotalAmount span').html(amount);
                });
  
                $('#txtAmount').on('blur keyup', function() {
                    //update display
                    $('.adfTotalAmount span').html($('#txtAmount').val());
                });
  
                //reset when manually entering an amount
                $('#adfOtherLabel').on('click', function() {
                    $('.amountButton .selected').removeClass('selected');
                    $(this).hide();
                    $('#txtAmount').show().val('').focus();
                    $('.giftAmountError').remove();
                });
  
                //$('#designationAreaDropdown').on('change', function() {
                //    if ($(this).val() !== '-1') {
                //        $('.adfOtherDesignationSubSection').show('blind','slow');
                //    } else {
                //        $('.adfOtherDesignationSubSection').hide('blind','slow');
                //    }
                //});
  
                //progressive display toggles
                $('.checkboxToggle').on('change', function() {
                    var targetString = $(this).attr('data-controler');
                    var targetContent = $('#' + targetString);
                    if ($(this).attr('checked')) {
                        targetContent.show('blind', 'slow');
                    } else {
                        targetContent.hide('blind', 'slow');
                    }
                });
  
                //populate dynamic dropdowns
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.populateTitle();
                BBI.Methods.populateDesignationIds();
                BBI.Methods.populateCascadingFields();
  
                //other area text entry.
                $('.otherArea').on('click', function() {
                    $('#otherArea').focus();
                });
  
                $('#otherArea').on('blur', function() {
                    $('#designationId').val(BBI.Defaults.generalFreeFormFund);
                }).on('focus', function() {
                    $('.designationButton .selected').removeClass('selected');
                    $('#fundDesignation1').val('0');
                    $('#fundDesignation2').val('0').hide();
                });
  
                $('#adfSubmitButton').on('click', function(e) {
                    e.preventDefault();
                    if (BBI.Methods.validateADF()) {
                        $(this).addClass('disabled').unbind('click');
                        BBI.Methods.submitADF();
                    }
                });
            }
        },
  
        getDonationData: function() {
            // create donation object
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $("#custom-amount").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [{
                        "Amount": "55.00",
                        "DesignationId": "89966342-d4b7-4030-b4b1-118678ab2648"
                    }],
                    IsAnonymous: false,
                    Attributes: [{
                        "Amount": "No",
                        "DesignationId": "c6079230-419d-46dc-b94e-c9db8eb5dbe5"
                    }],
                    MerchantAccountId: BBI.Defaults.MerchantAccountId
                },
                Origin: {
                    PageId: BBI.Defaults.pageId,
                    PageName: 'Giving Form'
                },
            };
  
            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                console.log(donation);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                // $("#adfSubmitButton")
                $(".btn-donate")
                    .on("click", function(e) {
                        e.preventDefault();
                        // if (BBI.Methods.validateADF()) {
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        // BBI.Methods.gf2SubmitADF();
                        BBI.Methods.getDonationData();
                        // }
                    })
                    .removeClass("disabled");
            };
  
            // console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );
  
            // return donation object
            return donation;
        },
  
        renderAmountList: function(arr) {
            var amtArray = arr;
            for (var i = 0; i < arr.length; i++) {
                $(".amounts").append("<a href='#' id='amt" + (i + 1) + "' class='amount' data-value='" + amtArray[i] + "'>$" + amtArray[i] + "</a>");
  
                //$("#amountList").append('<li><input type="radio" id="amount'+ (i+1) + '" name="amount" class="amount" value="' + amtArray[i] + '" /><label for="amount'+ (i+1) + '">$' + amtArray[i] + '</label></li>');
            }
            $(".amounts").append('<label for="otherAmtInput" class="otherAmt amount flex" style="width: 98%;"><span class="input-group-addon" style="font-weight:bold;">$</span><input type="text" class="form-control" id="otherAmtInput" style="font-family: Helvetica, Arial, sans-serif;font-weight:400;" placeholder="Your gift amount" autocomplete="off"></label>');
  
            // $("#amountList").append('<li><input type="radio" id="otherAmount" name="amount" class="amount" value="" /><label for="otherAmount"><input id="otherAmountInput" type="text" placeholder="$" class="BBFormTextbox DonationCaptureTextbox" value=""></label></li>');
        },
  
        renderFunds: function() {
            // variables for source code, finder number, category, subcategory, designation, amount, search, and funderTransactionId from URL
            var sourceCode;
            var finderNumber;
            var cat;
            var subcat;
            var des;
            var urlAmount;
            var urlSearch;
            var recurring;
            var hideack;
            var funderTransactionId;
            var urlDesignationGuid;
  
            var myGift = {};
  
            // Variables for the attribute GUIDs (add, subtract, rename as necessary)
            var otherDesignationGuid = "7f924538-ac30-4fa0-96c6-e243a2fddb12"; // generic attribute - use for "can't find your fund" functionality
            //var giftTypeGuid = "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb"; // Online Gift Type // commented
            //var donorTypeGuid = "f5c0424e-f97e-438b-a7e5-8201634bb98f"; // Online Gift Donor Type // commented
            var businessNameGuid = "562152e0-b70b-4080-9270-0e9cdc7a8b1e"; // Online Donation - Organization Name // commented
            var repNameGuid = "9f7369d0-a6ca-4faf-bf04-b2e8cc992f1a"; // Online Donation - Organization Representative Name
            var repTitleGuid = "e533e43d-e96c-4277-929f-449d178b3b8c"; // Online Donation - Organization Title
            // var instagramId = "955C9619-67A5-460A-99E6-11CC39E73D1B"; // Instagram social media handle
            // var twitterId = "C0DF4726-8B2D-4D55-BCD2-7C5555CFBB6B"; // Twitter social media handle
            var funderTransactionGuid = "9AD6ADE3-6342-4DC7-AE21-2EDBA8984530"; // Georgia Funder Transaction ID
  
            // global array for designations
            var designationArray = [];
  
            // Set Select2 options
            var select2options = {
                width: "100%"
            };
  
            /* GiftSession moved */
  
            function setCategories(e, subcat) {
                // SCHOOL OR COLLEGE selected
                // Arrays of tags to use for filtering designations.  FIRST VALUE IS FOR FILTERING - SECOND VALUE IS DISPLAYED TEXT.
                // Third value is for default designation.  If included, use this fund as the default choice.
                var schoolList = [
                    ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                    ["29 - Athletics and UCATS", "Athletics and UCATS"],
                    ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                    ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                    ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                    ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                    ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                    ["06 - College of Law", "College of Law"],
                    ["16 - College of Medicine", "College of Medicine"],
                    ["17 - College of Nursing", "College of Nursing"],
                    ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                    ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                    ["Hoxworth", "Hoxworth"],
                    ["33 - Institute for Policy Research", "Institute for Policy Research"],
                    ["02 - Lindner College of Business", "Lindner College of Business"],
                    ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                    ["28 - UC Alumni Association", "UC Alumni Association"],
                    ["12 - UC Blue Ash College", "UC Blue Ash College"],
                    ["42 - UC Cancer Center", "UC Cancer Center"],
                    ["07 - UC Clermont College", "UC Clermont College"],
                    ["30 - UC Foundation", "UC Foundation"],
                    ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                    ["20 - UC Health", "UC Health"],
                    ["26 - UC Libraries", "UC Libraries"],
                    ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                    /*
              ["Unrestricted", "University-wide", "D68341C5-71E8-4362-B8AB-1ECB3B192432"],
              ["Agricultural & Environmental Sciences", "College of Agricultural & Environmental Sciences", "327E1172-7A9D-412B-81B3-0C4B818B4FE7"],
              ["Art", "Lamar Dodd School of Art", ""],
              ["Arts & Sciences", "Franklin College of Arts & Sciences", "520B0C18-0C5F-43E6-A423-15EC1C391281"],
              ["Business", "Terry College of Business", "1BC6F137-A954-4102-BCA1-8A387D9A097F"],
              ["Ecology", "Odum School of Ecology", "1cb31da6-37ed-4a33-89fc-44d70a44228b"],
              ["Education", "Mary Frances Early College of Education", "4b88944b-61f9-4677-bdee-f68473b09566"],
              ["Engineering", "College of Engineering", "ccc1667e-baa4-4c8f-bad8-d0281dfdc489"],
              ["Environment & Design", "College of Environment & Design", "F14E8564-D235-4987-A77E-1AD5C00F2B35"],
              ["Family & Consumer Sciences", "College of Family & Consumer Sciences", "6C7806BF-F634-45A1-9F3B-2E82F2461BDD"],
              ["Forestry & Natural Resources", "Warnell School of Forestry & Natural Resources", "9B2D39CD-E1A0-4CFC-B2F1-7BBF43C0B4E8",
              ["Graduate School", "Graduate School", ""],
              ["Honors", "Morehead Honors College", "89589A70-F9DF-492C-887B-ED1375E302E1"],
              ["Institute of Higher Education", "Louis McBee Institute of Higher Education", "1092c9a2-4b7e-4128-88f2-19fb7608046c"],
              ["Journalism & Mass Communication", "Grady College of Journalism & Mass Communication", "BB7F6A3B-EE15-403F-BEB5-CA56571E02E5"],
              ["Law", "School of Law", "26FEA993-C301-4F3D-BFD8-76AB751D4FA0"],
              ["Music", "Hugh Hodgson School of Music", "369174db-0b6a-45fd-a1d2-e60cee848f98"],
              ["Pharmacy", "College of Pharmacy", "044F4724-ED3D-4C06-A201-DF1B76405376"],
              ["Public & International Affairs", "School of Public and International Affairs", "E24C17D4-3A7E-4D7B-9C20-52A88FE54635"],
              ["Public Health", "College of Public Health", "165856FD-3E2D-4F77-8BD0-D10E59E157DC"],
              ["Social Work", "School of Social Work", "F9EF229A-1FEC-4D88-8C8B-65F101B10E80"],
              ["Veterinary Medicine", "College of Veterinary Medicine", "E182BE1A-2CBC-4637-A20C-A845C66F45AE"]
              */
                ];
                var campusList = [
                    // OTHER AREA selected
                    ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                    ["29 - Athletics and UCATS", "Athletics and UCATS"],
                    ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                    ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                    ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                    ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                    ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                    ["06 - College of Law", "College of Law"],
                    ["16 - College of Medicine", "College of Medicine"],
                    ["17 - College of Nursing", "College of Nursing"],
                    ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                    ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                    ["Hoxworth", "Hoxworth"],
                    ["33 - Institute for Policy Research", "Institute for Policy Research"],
                    ["02 - Lindner College of Business", "Lindner College of Business"],
                    ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                    ["28 - UC Alumni Association", "UC Alumni Association"],
                    ["12 - UC Blue Ash College", "UC Blue Ash College"],
                    ["42 - UC Cancer Center", "UC Cancer Center"],
                    ["07 - UC Clermont College", "UC Clermont College"],
                    ["30 - UC Foundation", "UC Foundation"],
                    ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                    ["20 - UC Health", "UC Health"],
                    ["26 - UC Libraries", "UC Libraries"],
                    ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                    /*
              ["Unrestricted", "University-wide", "D68341C5-71E8-4362-B8AB-1ECB3B192432"],
              ["Academic Affairs", "Academic Affairs", "69840CF7-C92D-4F62-A688-30AB4EE04179"],
              //["Alumni Association","Alumni Association","D68341C5-71E8-4362-B8AB-1ECB3B192432"],
              ["Athletics", "Athletics", "F76EF7B9-FE9F-44DF-BE29-DDE3EC0A496F"],
              ["Botanical Garden", "Botanical Garden", "E7193632-CBF1-4B28-A287-93256F3E5976"],
              ["Development and Alumni Relations", "Development and Alumni Relations", ""],
              ["Finance & Administration", "Finance & Administration", ""],
              ["GA 4-H", "Georgia 4-H", ""],
              ["Georgia Museum of Art", "Georgia Museum of Art", "efc92e8a-9522-4057-bbe8-39fe1fe42737"],
              ["Graduate School", "Graduate School", "B7A97B3E-A487-499D-BE63-02BCBBB029BC"],
              ["Honors", "Morehead Honors College", "89589A70-F9DF-492C-887B-ED1375E302E1"],
              ["Institute of Higher Education", "Institute of Higher Education", "1092c9a2-4b7e-4128-88f2-19fb7608046c"],
              ["Instruction", "Instruction", "B7341668-FBB1-4DEC-804E-34C2245E32F5"],
              ["International Education", "International Education", "33235df9-cbee-44c2-9cd2-ccd77ca858af"], // previously 31B61FFF-CF0B-4382-8E9F-93D90F5CBB3C
              ["Libraries", "Libraries", "8BE3F2A9-496D-4647-88FF-34692B1B2F9A"],
              ["Medical Partnership", "Medical Partnership", "887BD6B1-B4E5-4593-B0E4-504F1B25D266"],
              ["Performing Arts Center", "Performing Arts Center", "573BE834-8493-40D0-BA69-D8E29EFD71B6"],
              ["President's Office", "President's Office", "3FCC3C1C-7465-4D8F-BDFE-5EF360EBBFD3"],
              ["Public Service & Outreach", "Public Service & Outreach", "2DB1D4DD-0EF4-4534-8547-841811F6EAB4"],
              ["Research", "Research", "50FB55F5-DB73-417A-BA81-CF1D6B708D83"],
              ["Student Affairs", "Student Affairs", "ab10ed56-b3d9-418a-9352-f3658b7ef3df"],
              //["University of Georgia","University of Georgia",""],
              //["Unrestricted","Unrestricted",""],
              ["WUGA", "WUGA", ""]*/
                ];
                var causeList = [
                    ["COVID19 Response", "COVID19 Response", ""],
                    ["Campus-wide Support", "Campus-wide Support", ""],
                    ["Animal Welfare", "Animal Welfare", ""],
                    ["Arts & Humanities", "Arts & Humanities", ""],
                    ["Between the Pages", "Between the Pages", ""],
                    ["Community", "Community", ""],
                    ["Diversity & Inclusion", "Diversity & Inclusion", ""],
                    ["Economic Growth", "Economic Growth", ""],
                    ["Entrepreneurship", "Entrepreneurship", ""],
                    ["Environment", "Environment", ""],
                    ["Experiential Learning", "Experiential Learning", ""],
                    ["Faculty Support", "Faculty Support", ""],
                    ["Food safety & supply", "Food safety & supply", ""],
                    ["Georgia Coast", "Georgia Coast", ""],
                    ["Global Security", "Global Security", ""],
                    ["Health & Wellness", "Health & Wellness", ""],
                    ["Infectious Disease Research", "Infectious Disease Research", ""],
                    ["Leadership Development", "Leadership Development", ""],
                    ["Social Justice", "Social Justice", ""],
                    ["Student Life", "Student Life", ""],
                    ["Student Scholarships", "Student Scholarships", ""],
                    ["Technology", "Technology", ""]
                ];
  
                if (e == "default") {
                    var category = "school";
                } else {
                    if (typeof e == "object") {
                        // event object passed from selector click
                        var category = e.target.id;
                    } else {
                        // category string passed, taken from URL parameter
                        var category = e;
                    }
                }
                if (category.toLowerCase() == "otherarea") category = "campus";
                switch (category) {
                    case "school":
                        selectList = schoolList;
                        break;
                    case "campus":
                        selectList = campusList;
                        break;
                    case "cause":
                        selectList = causeList;
                        break;
                    default:
                        selectList = schoolList;
                        break;
                }
                var categorySelector = document.getElementById("categoryList");
                categorySelector.innerHTML = "";
                if (category == "cause")
                    $("#categoryList").append(
                        '<option value selected="selected">Make a selection</option>'
                    );
                for (var i = 0; i < selectList.length; i++) {
                    var opt = document.createElement("option");
                    opt.value = selectList[i][0].toLowerCase().replace(/[\'\"]/g, "");
                    opt.innerHTML = selectList[i][1];
                    opt.setAttribute("data-default", selectList[i][2]);
                    categorySelector.appendChild(opt);
                }
  
                // If 'subcat' is passed, mark that category as selected
                if (subcat) {
                    $(
                        "#categoryList option[value='" +
                        subcat.toLowerCase().replace(/[\'\"]/g, "") +
                        "']"
                    ).attr("selected", "selected");
                }
                $("#categoryList").select2(select2step1options);
            }
  
            function filterDesignations(txt, type, def) {
                // load designations based on category chosen
                var desArray = [];
                desArray = designationArray;
                console.log(desArray); // uncommented
                var desId = document.getElementById("designationId");
                desId.innerHTML = "";
  
                // Counter for number of designations found
                var desCount = 0;
  
                for (var i = 0; i < desArray.length; i++) {
                    for (var j = 0; j < desArray[i].length; j++) {
                        if (type == "tag") {
                            // Look for exact string match.
                            var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                            comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
  
                            // console.log("desArray[i][j]: " + desArray[i][j]);
                            // Accommodate the tag name change from "Honors Program" to "Honors".  If it's either one, it can match either one.
                            /*
                      if (compTxt == "honors program" || compTxt == "honors")
                          comp =
                              "honors" == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "") ||
                              "honors program" == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
                      */
                        } else {
                            comp = desArray[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;
                        }
                        if (comp) {
                            var opt = document.createElement("option");
                            // opt.value = desArray[i][1];
                            opt.value = desArray[i][6]; // GUID of Designation
                            // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                            opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                            opt.setAttribute("data-description", desArray[i][4]); // Designation Description // desArray[i][3]
                            desId.appendChild(opt);
                            desCount++; // add to designation count
                            break;
                        }
                    }
                }
  
                var causeSelected = $("#cause").hasClass("selected") == true;
  
                // append "can't find your fund" option
                var otherOpt = document.createElement("option");
                otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                //"D68341C5-71E8-4362-B8AB-1ECB3B192432"; // submit default designation (Georgia Fund)
                otherOpt.innerHTML = "Can't find your fund?";
                if (causeSelected) {
                    otherOpt.setAttribute(
                        "data-description",
                        'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                    );
                } else {
                    otherOpt.setAttribute(
                        "data-description",
                        "Please enter a brief description of the area you would like to support below."
                    );
                }
                otherOpt.setAttribute("data-other", true);
                desId.appendChild(otherOpt);
  
                if (desCount == 1) {
                    $("#designationCount").text(" (" + desCount + " result found)");
                    $("#designationId option").first().attr("selected", "selected");
  
                    //$("#designationId").val($("#designationId option:first").val());
                    $("#designationId").val($("#designationId option").first().val());
                } else {
                    $("#designationCount").text(" (" + desCount + " results found)");
                }
                $("#designationCount").show();
  
                if (def && def.length > 10) {
                    $("#designationId").val(def.toLowerCase());
                } else {
                    var desId = $("#designationId option:contains('" + def + "')").val();
                    if (desId) $("#designationId").val(desId.toLowerCase());
                }
  
                $("#designationId").select2(select2step1options);
                $("div[id*='designationId']").effect("highlight", {}, 700);
                setDescription();
            }
  
  
            // See about putting everything in here instead of initializing the Query API in the form setup.
            // Maybe pass the Query ID instead of hard-coding it inside the function.
            //blockForm($(".donationForm"));
  
            var queryInstanceId = "4146d3c8-c678-4b1a-9a23-1c163c05b39f"; // "b0e28c08-4081-4328-91f5-8509243f5d79";
            //"aa7bb498-5129-4ec5-ac1b-9fd9e560449d"; // BBIS - Find a Fund Designations - Abridged
            var queryOptions = {
                crossDomain: false
            };
            var filters = [];
            var queryService = new BLACKBAUD.api.QueryService(queryOptions);
  
            querySuccess = function(obj) {
                designationArray = [];
                for (var i = 0; i < obj.Rows.length; i++) {
                    var tempArray = [
                        obj.Rows[i].Values[0],
                        obj.Rows[i].Values[1],
                        obj.Rows[i].Values[2],
                        obj.Rows[i].Values[3],
                        obj.Rows[i].Values[4],
  
                        obj.Rows[i].Values[5],
                        obj.Rows[i].Values[6],
                        obj.Rows[i].Values[7],
                        obj.Rows[i].Values[8],
                        obj.Rows[i].Values[9]
                    ];
  
                    if (i > 1 && obj.Rows[i].Values[0] == obj.Rows[i - 1].Values[0]) {
                        designationArray[designationArray.length - 1].push(obj.Rows[i].Values[4]);
                    } else {
                        designationArray.push(tempArray);
                    }
                }
  
                // sort array results and remove duplicates
                var sortedArray = designationArray.sort(compare);
                var tidiedArray = [];
  
                /* alternate designation process:
                - create second array (tidiedArray)
                - loop through first array and
                -- push funds that aren't already in the array
                -- if they are already in the array, push the tag */
                for (var i = 0; i < sortedArray.length; i++) {
                    if (tidiedArray.indexOf(sortedArray[i]) < 0) {
                        tidiedArray.push(sortedArray[i]);
                    }
                }
  
                for (var i = 0; i < sortedArray.length - 1; i++) {
                    // need a way to check more than just the next, or previous, fund
                    // for each fund, loop through the upcoming funds until the name does NOT match the current name - grab and push the tags and delete the funds
  
                    if (sortedArray[i][0] == sortedArray[i + 1][0]) {
                        sortedArray[i + 1].push(sortedArray[i][3]);
                        sortedArray.splice(i, 1);
                    }
                }
                designationArray = sortedArray;
  
                // Generate option elements for designation selectors, based on designationArray
                for (var i = 0; i < designationArray.length; i++) {
                    var otherDes = document.getElementById("designationId");
                    var otherOpt = document.createElement("option");
                    otherOpt.value = designationArray[i][1];
                    otherOpt.innerHTML =
                        designationArray[i][0] + " - " + designationArray[i][2];
                    otherOpt.setAttribute("data-description", designationArray[i][4]);
                    otherDes.appendChild(otherOpt);
                }
                if (subcat) {
                    // *** add des filter.  It should fail gracefully, if fund isn't found...
                    updateCategories(cat, subcat);
                    setCategories(cat, subcat);
                    if (des) {
                        filterDesignations(subcat, "tag", des);
                    } else {
                        var def = $(
                            "#categoryList option[value='" +
                            subcat.toLowerCase().replace(/[\'\"]/g, "") +
                            "']"
                        ).attr("data-default");
                        filterDesignations(subcat, "tag", def);
                    }
                } else if (des) {
                    setCategories("default");
                    filterDesignations(des, "search", des);
                } else if (urlSearch) {
                    setCategories("default");
                    filterDesignations(urlSearch, "search");
                } else if (cat) {
                    // This should be run if a category is sent, but no subcategory.  Should work for all four categories.
                    updateCategories(cat);
                    setCategories(cat);
                } else {
                    setCategories("default");
                    filterDesignations(
                        //"Unrestricted",
                        "99 - Others", // Unit Attribute\Value column
                        "tag",
                        "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                        //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                    );
                }
                $("#designationId").select2(select2step1options);
                unblockForm($(".donationForm"));
            };
            queryFailure = function(obj) {
                unblockForm($(".donationForm"));
            };
            var queryResults = queryService.getResults(
                queryInstanceId,
                querySuccess,
                queryFailure,
                filters
            );
        },
  
        populateCountryDropdowns: function() {
            var countryService = new BLACKBAUD.api.CountryService({
                url: BBI.Defaults.rootpath,
                crossDomain: false
            });
            countryService.getCountries(function(country) {
                $.each(country, function() {
                    $("#ackCountry")
                        .append($("<option></option>")
                            .val(this["Abbreviation"])
                            .text(this["Description"])
                            .attr("id", this["Id"]));
                });
                BBI.Methods.populateStateDropdowns($("#ackCountry").find("[value='USA']").attr("id"));
                $("#ackCountry").val("USA").on("change", function() {
                    var countryID = $(this).find(":selected").attr("id");
                    BBI.Methods.populateStateDropdowns(countryID);
                });
            });
        },
  
        populateStateDropdowns: function(countryID) {
            var countryService = new BLACKBAUD.api.CountryService({
                url: BBI.Defaults.rootpath,
                crossDomain: false
            });
            countryService.getStates(countryID, function(state) {
                $("#ackState option:gt(0)").remove();
                $.each(state, function() {
                    $("#ackState").append($("<option></option>").val(this["Abbreviation"]).text(this["Description"]));
                });
            });
        },
  
        // get title table
        populateTitle: function() {
            var selectAckTitle = $('#ackTitle');
  
            $.get(BLACKBAUD.api.pageInformation.rootPath + 'webapi/CodeTable/' + BBI.Defaults.titleTable, function(data) {
                for (var i = 0, j = data.length; i < j; i++) {
                    selectAckTitle.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
                }
            }).done(function() {
                selectAckTitle.val('-1').change();
            });
        },
  
        populateDesignationIds: function() {
            var queryService = new BLACKBAUD.api.QueryService();
  
            queryService.getResults(BBI.Defaults.highlightedFundsQueryId, function(data) {
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];
                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });
                $.each(rows, function() {
                    var values = this['Values'],
                        designationID = values[fieldArray['System record ID']],
                        designationName = values[fieldArray['Public name']], // use friendly name
                        itemHTML = '<li class="designationButton"><a rel="' + designationID + '">' + designationName + '</a></li>';
                    $('.designationButtonWrapper').append(itemHTML);
                });
                $('.designationButton a').on('click', function() {
                    $('.designationButton .selected').removeClass('selected');
                    $(this).addClass('selected');
                    $('#designationId').val($(this).attr('rel'));
                    $('#fundDesignation1').val('0');
                    $('#fundDesignation2').val('0').hide();
                });
            });
        },
  
        populateCascadingFields: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var mainDesignation = $('#fundDesignation1');
            var subDesignation = $('#fundDesignation2');
  
            if ($(mainDesignation).length !== 0) {
                var queryService = new BLACKBAUD.api.QueryService();
                queryService.getResults(BBI.Defaults.cascadingFundsQueryId, function(data) {
                    // fund data
                    var allFunds = data.Rows;
                    var fundMaster = [];
                    var topLevelAll = [];
  
                    // remove all options in main drop-down except the first
                    $(mainDesignation).find('option').not('option:first').remove();
  
                    // get drop-down hierarchy and clean arrays
                    $.each(allFunds, function() {
                        // define values
                        var values = this.Values;
                        var target = values[3];
                        var splitter = target.split('\\');
  
                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }
  
                        // push values to array
                        splitter.push(values[5]); // update key to match designation GUID
                        splitter.push(values[2]);
                        fundMaster.push(splitter);
                        topLevelAll.push(splitter[0]);
                        // console.log(fundMaster);
                    });
  
                    // filter unique values
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }
  
                    var topLevelUnique = topLevelAll.filter(onlyUnique);
  
                    $.each(topLevelUnique, function(key, value) {
                        $(mainDesignation).append($("<option></option>").val(value).text(value));
                    });
  
                    // category drop-down
                    $(mainDesignation).on('change', function() {
                        // remove selected class from designation buttons
                        $('.designationButton .selected').removeClass('selected');
  
                        // define designation selection
                        var selection = $(this).val();
  
                        // remove all options in sub drop-down except the first
                        $(subDesignation).find('option').not('option:first').remove();
  
                        // loop through funds
                        $.each(fundMaster, function(x, subFund) {
                            // append GUID if terminal
                            if (subFund[0] === selection) {
                                $(subDesignation).append($("<option></option>").val(subFund[1]).text(subFund[2]));
                            }
                        });
  
                        // toggle designation drop-down
                        if ($(this).val() === '0') {
                            $(subDesignation).hide();
                        } else {
                            $(subDesignation).show();
                        }
                    });
                });
            }
        },
  
        initAdfTabs: function() {
            //default state
            $('#adfTributToggle').show();
            $('#adfFrequency').hide();
  
            $('#adfTabsMenu a').on('click', function() {
                var tabReference = $(this).attr('id');
                $('#adfTabsMenu .selected').removeClass('selected');
                $(this).parent('li').addClass('selected');
                //handle states of form
                if (tabReference === 'tabRecurring') {
                    $('#adfTributToggle').hide();
                    $('#adfFrequency').show();
  
                } else if (tabReference === 'tabPledge') {
                    $('#adfFrequency').hide();
  
                } else if (tabReference === 'tabFaculty') {
                    $('#adfFrequency').hide();
  
                } else { //tabOneTime
                    //default state
                    $('#adfTributToggle').show();
                    $('#adfFrequency').hide();
  
                }
            });
  
        },
  
        validateADF: function() {
            var ValidationMessage = [];
            var isValid = true;
            $('.required:visible').each(function() {
                if ($.trim($(this).val()) === '' || $(this).val() == '-1') {
                    var requiredFieldMessage = '<span class="invalidLabel adfNote"><i class="fa fa-exclamation-circle"></i>This is a required field.</span>';
                    isValid = false;
                    $(this).addClass('invalid');
                    $(this).after(requiredFieldMessage);
                }
            });
            if ($('#giftListEmpty').is(':visible')) {
                // console.log(isValid + ":(");
                isValid = false;
                $('.BBFormValidatorSummary').html('<p class="giftAmountError">Please add an item to your cart.</p>');
            }
            $('.invalid').first().focus();
            $('.invalid').on('keydown', function() {
                $(this).unbind('keydown');
                $(this).removeClass('invalid');
                $(this).parent().find('.invalidLabel').remove();
            });
            return isValid;
        },
  
        submitADF: function() {
            var partId = $('.BBDonationApiContainer').attr('data-partid'),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false
                }),
                giftAmount = $('#txtAmount').val(),
                designationID = $('#designationId').val(),
                customAttributes = [],
                designationArray = [];
  
            var donation = {
                "Gift": {
                    "Designations": [],
                    "IsAnonymous": false,
                    "MerchantAccountId": BBI.Defaults.MerchantAccountId
                }
            };
  
            // if the path contains "/givetoday",
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/givetoday')) {
                var origin = {
                    "AppealId": "BF7730F5-C275-4C2F-A08C-A33A29F2FBBA",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }
  
                donation.Origin = origin;
            }
  
  
            // if the path contains "/impact2016"
            // Appeal: FY17 Faculty & Staff Campaign
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/impact2016')) {
                var origin = {
                    "AppealId": "b76d6373-51f0-4268-a35c-92bb1c8de65f",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }
  
                donation.Origin = origin;
            }
  
  
            // if the path contains "/impact16"
            // Appeal: FY17 Faculty & Staff Campaign 
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/givetoday')) {
                var origin = {
                    "AppealId": "55a0b0ac-ed24-470e-b42f-5a537eca152f",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }
  
                donation.Origin = origin;
            }
  
            if ($('#anonymous:checked').length !== 0) {
                donation.Gift.IsAnonymous = true;
            }
  
            //other area free text entry
            if ($('#giftListNotEmpty .otherDesignation').length !== 0) {
                donation.Gift.Comments = "Area of support: " + $('#giftListNotEmpty .otherDesignation .fund-name').text();
            }
  
            if ($('#fundDesignation2 option:selected').val() !== "0") {
                designationID = $('#fundDesignation2 option:selected').val();
            }
  
            /*if ($('#adfTributToggle > label > input:checked').length !== 0) {
                var Tribute = {};
                if ($('#isTributeNotification:checked').length !== 0) {
                    Tribute.Acknowledgee = {
                        "FirstName" : $('#ackFirstName').val(),
                        "LastName" : $('#ackLastName').val(),
                        "AddressLines" : $('#ackAddressLines').val(),
                        "City" : $('#ackCity').val(),
                        "Country" : $('#ackCountry').val(),
                        "Email" : $('#ackEmail').val(),
                        "Phone" : $('#ackPhone').val(),
                        "PostalCode" : $('#ackPostalCode').val(),
                        "State" : $('#ackState').val()
                    };
                }
                Tribute.TributeDefinition = {
                        "Type" : $('#tributeType').val(),
                        "FirstName": $('#honoreeFirstName').val(),
                        "LastName": $('#honoreeLastName').val(),
                        "Description": $('#tributeType').val()
                };
                donation.Gift.Tribute = Tribute;
            }*/
  
            // tribute (honoree) attributes
            if ($('#adfTributToggle > label > input:checked').length !== 0) {
                if ($('#tributeType:visible').length !== 0) {
                    var tributeType = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Tribute Gift Type'],
                        "Value": $('#tributeType').val()
                    };
                    customAttributes.push(tributeType);
                }
  
                if ($('#honoreeFirstName').length !== 0 && $('#honoreeLastName').length !== 0) {
                    var honoreeName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Honoree Name'],
                        "Value": $('#honoreeFirstName').val() + ' ' + $('#honoreeLastName').val()
                    };
                    customAttributes.push(honoreeName);
                }
            }
  
            // acknowledgee attributes
            if ($('#ackCheck > input:checked').length !== 0) {
                if ($('#ackTitle').length !== 0 && $('#ackTitle').val() !== '-1') {
                    var ackTitle = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Title'],
                        "Value": $('#ackTitle option:selected').text()
                    };
                    customAttributes.push(ackTitle);
                }
  
                if ($('#ackFirstName').length !== 0) {
                    var ackFirstName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee First Name'],
                        "Value": $('#ackFirstName').val()
                    };
                    customAttributes.push(ackFirstName);
                }
  
                if ($('#ackLastName').length !== 0) {
                    var ackLastName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Last Name'],
                        "Value": $('#ackLastName').val()
                    };
                    customAttributes.push(ackLastName);
                }
  
                if ($('#ackAddressLines').length !== 0) {
                    var ackAddress = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Address'],
                        "Value": $('#ackAddressLines').val()
                    };
                    customAttributes.push(ackAddress);
                }
  
                if ($('#ackCity').length !== 0) {
                    var ackCity = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee City'],
                        "Value": $('#ackCity').val()
                    };
                    customAttributes.push(ackCity);
                }
  
                if ($('#ackState').length !== 0) {
                    var ackState = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee State'],
                        "Value": $('#ackState').val()
                    };
                    customAttributes.push(ackState);
                }
  
                if ($('#ackPostalCode').length !== 0) {
                    var ackZip = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Zip'],
                        "Value": $('#ackPostalCode').val()
                    };
                    customAttributes.push(ackZip);
                }
  
                if ($('#ackCountry').length !== 0) {
                    var ackCountry = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Country'],
                        "Value": $('#ackCountry').val()
                    };
                    customAttributes.push(ackCountry);
                }
  
                if ($('#ackPhone').length !== 0 && $('#ackPhone').val() !== '') {
                    var ackPhone = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Phone'],
                        "Value": $('#ackPhone').val()
                    };
                    customAttributes.push(ackPhone);
                }
  
                if ($('#ackEmail').length !== 0 && $('#ackEmail').val() !== '') {
                    var ackEmail = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Email'],
                        "Value": $('#ackEmail').val()
                    };
                    customAttributes.push(ackEmail);
                }
  
                // not on form
                if ($('#ackClassYear:visible').length !== 0) {
                    var ackClassYear = {
                        "AttributeId": BBI.Defaults.customADFAttributes['UC Graduation Year'],
                        "Value": $('#ackClassYear').val()
                    };
                    customAttributes.push(ackClassYear);
                }
  
                // not on form
                if ($('#ackDegree:visible').length !== 0) {
                    var ackDegree = {
                        "AttributeId": BBI.Defaults.customADFAttributes['UC Graduation Degree'],
                        "Value": $('#ackDegree').val()
                    };
                    customAttributes.push(ackDegree);
                }
            }
  
            if ($('#company:visible').length !== 0) {
                var company = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Matching Gift Company'],
                    "Value": $('#company').val()
                };
                customAttributes.push(company);
            }
  
            if ($('#spouseName:visible').length !== 0) {
                var spouseName = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Joint Spouse Name'],
                    "Value": $('#spouseName').val()
                };
                customAttributes.push(spouseName);
            }
  
            if ($('#pledgeID:visible').length !== 0) {
                var pledge = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Pledge ID'],
                    "Value": $('#pledgeID').val()
                };
                customAttributes.push(pledge);
            }
  
            if ($('#frequency:visible').length !== 0) {
                var startDate = Date.parse();
                var endDate = ($('#endDate').val().length !== 0) ? $('#endDate').val() : null;
                donation.Gift['Recurrence'] = {
                    "DayOfMonth": 1,
                    "Frequency": $('#frequency').val(),
                    "StartDate": $('#startDate').val(),
                    "EndDate": endDate
                };
            }
  
            /*if ($('#otherArea:visible').length !== 0 && $('#otherArea:visible').val().length > 0) {
                var otherArea = {
                    "Value": $('#otherArea').val()
                };
                donation.Gift.Comments.push(otherArea);
            }*/
  
            donation.Gift.Attributes = customAttributes;
  
            // one-time gift
            if ($('#tabOneTime').parent().hasClass('selected')) {
                var giftRow = $('#giftListNotEmpty > table > tbody > tr');
                $.each(giftRow, function() {
                    var fundAmount = $(this).find('.fund-amount').text().replace('$', '');
                    var fundDesignation = $(this).find('.fund-designation').text();
                    var gift = {
                        "Amount": fundAmount,
                        "DesignationId": fundDesignation
                    };
                    designationArray.push(gift);
                });
  
                donation.Gift.Designations = designationArray;
                // console.log(designationArray);
                // pledge gift
            } else {
                if ($('.amountButton a').hasClass('selected')) {
                    donation.Gift.Designations = [{
                        'Amount': $('.amountButton a.selected').attr('rel'),
                        'DesignationId': BBI.Defaults.pledgeFund
                    }];
                } else if (!$('.amountButton').hasClass('selected') && $('#txtAmount').val() !== '') {
                    donation.Gift.Designations = [{
                        'Amount': $('#txtAmount').val(),
                        'DesignationId': BBI.Defaults.pledgeFund
                    }];
                }
            }
  
            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(data);
            };
  
            donationFail = function(d) {
                $('.BBFormValidatorSummary').html('<p>' + BBI.Methods.convertErrorsToHtml(d) + '</p>');
                $('#adfSubmitButton').on('click', function(e) {
                    e.preventDefault();
                    if (BBI.Methods.validateADF()) {
                        $(this).addClass('disabled').unbind('click');
                        BBI.Methods.submitADF();
                    }
                }).removeClass('disabled');
            };
            // console.log(donation);
            donationService.createDonation(donation, donationSuccess, donationFail);
  
        },
  
        foundationbgFix: function() {
            // Derry Spann Added JS fix
            var wwidth = $(window).width();
            // toggle responsive menu classes for sub menus
            if (wwidth <= 816) {
                var mobileHeroBg = $('.wrapBreadcrumbs img').first().hide().attr('src');
                if (mobileHeroBg) {
                    $('.fullWidthBackgroundImage').css({
                        'display': 'block',
                        //'height': '94vh',
                        'position': 'relative',
                        'background-image': 'url(' + mobileHeroBg + ')',
                        'background-size': 'cover',
                        'margin-top': '90px'
                    });
                } else {
                    $('.fullWidthBackgroundImage').removeAttr("style");
                }
            }
  
        },
  
        buildSocialButtons: function() {
  
            if ($('.socialButtonTable').length > 0) {
                function popUp(url) {
                    socialWindow = window.open(url, "littleWindow", "location=no,width=600,height=500,left=300,top=300");
                }
                $(".socialButtonTable").each(function() {
                    var buttonType = $(this).find(".socialButtonType").text();
                    var buttonClass = "";
                    var buttonText = $(this).find(".socialButtonText").text();
                    var buttonContent = $(this).find(".socialButtonContent").text();
                    var url = "";
  
                    if (buttonType.match("Facebook")) {
                        //buttonClass="btn-facebook";url = "https://web.archive.org/web/20180119002129/http://www.facebook.com/sharer/sharer.php?s=100&p[url]=www.CLIENTURL.org&p[title]=CLIENTNAME&p[summary]=";
                        buttonClass = "btn-facebook";
                        //url = "www.facebook.com";
                        url = "https://web.archive.org/web/20180119002129/http://www.facebook.com/sharer.php?u=" + buttonContent;
                    } else if (buttonType.match("Twitter")) {
                        buttonClass = "btn-twitter";
                        //buttonContent = escape(buttonContent);
                        url = "https://web.archive.org/web/20180119002129/http://twitter.com/intent/tweet?text=" + buttonContent;
                    } else {
                        // console.log("invalid button type: " + buttonType);
                    }
                    //$(this).after("<a class='btn-social "+buttonClass+"' target='_blank' href='"+url+buttonContent+"'><span class='icon'></span><span class='title'>"+buttonText+"</span></a>");
                    $(this).after("<a class='btn-social " + buttonClass + "' href='" + url + "'><span class='icon'></span><span class='title'>" + buttonText + "</span></a>");
                    $(this).hide();
                });
  
                $('.btn-social').each(function() {
                    $(this).click(function(e) {
                        e.preventDefault();
                        window.open($(this).attr('href'), 'title', 'width=600,height=400');
                        return false;
                    });
                });
            }
        },
  
        convertErrorToString: function(error) {
            if (error) {
                if (error.Message)
                    return error.Message;
                switch (error.ErrorCode) {
                    case 101:
                        return error.Field + " is required.";
                    case 105:
                        return error.Field + " is not valid.";
                    case 106:
                        return "Record for " + error.Field + " was not found.";
                    case 203:
                        return "Donation not completed on BBSP.";
                    case 107:
                        return "Max length for " + error.Field + " exceeded.";
                    default:
                        return "Error code " + error.ErrorCode + ".";
                }
            }
        },
  
        convertErrorsToHtml: function(errors) {
            var i, message = "Unknown error.<br/>";
            if (errors) {
                message = "";
                for (i = 0; i < errors.length; i++) {
                    message = message + BBI.Methods.convertErrorToString(errors[i]) + "<br/>";
                }
            }
            return message;
        },
  
        adminStyleFixes: function() {
            $('[class*="show-for-"], [class*="hide-for-"], .fullWidthBackgroundImage, .fullWidthBackgroundImageInner').attr('class', '');
            $('header div').not('[id^="pane"], [id^="pane"] div').css('position', 'static');
            $('.fullWidthBackgroundImageInner').show();
        },
  
        getUrlVars: function() {
            // Gets variables and values from URL
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                vars[key] = unescape(value.replace(/\+/g, " "));
            });
            return vars;
        },
  
        returnQueryValueByName: function(name) {
            return BLACKBAUD.api.querystring.getQueryStringValue(name);
        },
  
        fixPositioning: function() {
            // Fix positioning:
            $('div[id *= "_panelPopup"]').appendTo('body');
            $('div[id *= "_designPaneCloak"]').css({
                "top": "0px",
                "left": "0px"
            });
            $('.DesignPane').css("position", "relative");
        },
  
        setCookie: function(c_name, value, exdays) {
            var exdate = new Date();
            //allows for reading cookies across subdomains
            var cd = window.location.host.substr(window.location.host.indexOf("."));
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value + "; domain=" + cd + "; path=/";
        },
  
        readCookie: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
  
        initMobileHeader: function() {
            $("#mobileLogo").headroom({
                offset: 80
            });
        },
  
        mobileSubMenu: function() {
            $('.mobileCanvas.rightCanvas ul.menu li.parent > a').click(function(event) {
                if ($(this).parent().hasClass('open')) {
                    // open link
                } else {
                    event.preventDefault();
                    $(this).parent().toggleClass('open');
                    $(this).next().slideToggle();
                }
            });
        },
  
        jobOpportunities: function() {
            $('.job-title').click(function(event) {
                $(this).toggleClass('open').next().slideToggle('slow');
            });
            $('.close-description').click(function(event) {
                $(this).parents('.job-description').slideUp('slow').prev().removeClass('open');
            });
        },
  
        /**********************************************
        CUSTOM DONATION FORM
           Broken Down into 3 Objects by Step
        ***********************************************/
  
        customSingleDonationForm: {
  
            // Add Classes to parent Tbody of each section of the hidden form
            tbodyClasses: function() {
                // Set Vars
                var donationInfo, additionalInfo, designationSelectList, billingInfo, tributeInfo, paymentInfo;
                // Donation Information/Amount
                donationInfo = $('[id*="txtAmount"]').parents('tbody').addClass('donationInfo');
                // Additional Information
                additionalInfo = $('[id*="trDesignation"]').parents('tbody').addClass('additionalInfo');
                // Billing Information
                billingInfo = $('[id*="DonationCapture1_txtFirstName"]').parents('tbody').addClass('billingInfo');
                // Tribute Information
                tributeInfo = $('[id*="lblTributeHeading"]').parents('tbody').addClass('tributeInfo');
                // Tribute Name
                //tributeNameInput = '.tributeInfo [id*="trTributeName"] input[id*="txtTribute"]';
                // Tribute Type Select List
                //tributeTypeSelectList = '.tributeInfo [id*="trTributeDesc"] select[id*="ddlTribute"]';
                // Tribute Description Input
                //tributeDescInput = '.tributeInfo [id*="trTributeDesc2"] input[id*="txtTributeDescription"]';
                // Payment Information
                //paymentInfo = $('[id*="DonationCapture1_lblCardHoldersName"]').parents('tbody').addClass('paymentInfo');
            },
  
            /**********************************************
            Step 1 - Get Designation ID and Gift Amount
            ***********************************************/
  
            stepOneGivingDetails: {
  
                fundDesignationOption: function() {
                    var shownFundList, hiddenFundDesgList;
                    hiddenFundDesgList = $('.additionalInfo select[id*="ddlDesignations"]').children().clone();
                    $('<select id="fundDesignList"></select>').prependTo('ul.fundDesignation li.fundDesignationList');
                    shownFundList = 'select#fundDesignList';
                    if ($('ul.fundDesignation li.fundDesignationList select option').length === 0) {
                        $(hiddenFundDesgList).prependTo(shownFundList);
                    }
                    $('select#fundDesignList option').click(function() {
                        $('select#fundDesignList option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');
                    });
  
                    // Match Selected Fund to Hidden Fund
                    $(shownFundList).on('change', function() {
                        var shownFundListSelected = $('select#fundDesignList option:selected');
                        var hiddenFundList = '.additionalInfo select[id*="ddlDesignations"]';
                        $(hiddenFundList).find('option[value="' + shownFundListSelected.val() + '"]').attr('selected', true);
                    });
                },
  
                clickHiddenAmount: function() {
                    $('input[value="rdoOther"]').click(); // auto-select "Other" amount option in hidden form (on page load)
                    var checkedRadio = $('.givingAmountOptions input[name="amount"]:checked').val(); // set initial val for :checked option (on page load)
                    $('.DonationFormTable input[id$="txtAmount"]').val(checkedRadio);
                },
  
                // Donation Amount
                donationAmount: function() {
                    $('#addToCart a').on('click', function() {
                        var sum = 0;
                        // iterate through each amount cell and add the values
                        $('.fund-amount').each(function() {
                            var value = $(this).text().replace('$', '');
                            // add only if the value is number
                            if (!isNaN(value) && value.length != 0) {
                                sum += parseFloat(value);
                            }
                            $('.adfTotalAmount span').text(sum);
                        });
                    });
                    /*var otherAmountRadio = $('.givingAmountOptions .otherAmount input[type="radio"]#otherAmt');
                    var otherAmountText = $('.givingAmountOptions .otherAmount input[type="text"]');
                    var giftAmountShown = $('.givingAmountOptions input[type="radio"][id*="opt"]');
                    var giftAmountHidden = $('.DonationFormTable input[id$="txtAmount"]');
  
                    giftAmountShown.change(function() {
                        var rdoAmtChk = $('.givingAmountOptions input[type="radio"][id*="opt"]:checked').val();
                        otherAmountText.val('');
                        otherAmountText.attr('disabled', true);
                        giftAmountHidden.val(rdoAmtChk);
                    });
  
                    otherAmountRadio.click(function() {
                       otherAmountText.attr('disabled', false);
                    });
  
                    otherAmountText.keyup(function() {
                        giftAmountHidden.val($(this).val());
                    });*/
                }
            },
  
  
            /**********************************************
            Step 2 - GET DONOR NAME AND BILLING INFO
            ***********************************************/
  
            stepTwoDonorInfo: {
  
                // STEP 2A: GET BILLING NAME
                billingName: function() {
                    var billingFirstName, billingLastName, hiddenFirstName, hiddenLastName;
                    billingFirstName = '.donorFirstName #billingFirstName';
                    billingLastName = '.donorLastName #billingLastName';
                    hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                    hiddenLastName = '.billingInfo [id*="txtLastName"]';
                    // Get First Name entered
                    $(billingFirstName).blur(function() {
                        var billingFirstNameEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenFirstName).val(billingFirstNameEnt);
                        }
                    });
                    // Get Last Name entered
                    $(billingLastName).blur(function() {
                        var billingLastNameEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenLastName).val(billingLastNameEnt);
                        }
                    });
                },
  
                // STEP 2B: GET BILLING ADDRESS
                billingAddress: function() {
                    var billingAddress, hiddenBillingAddress;
                    billingAddress = '.personalInfoList #billingAddress';
                    hiddenBillingAddress = '.billingInfo [id*="AddressLine"]';
                    // Get Address entered
                    $(billingAddress).change(function() {
                        var billingAddressEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingAddress).val(billingAddressEnt);
                        }
                    });
                },
                // STEP 2C: GET BILLING Title
                billingTitleList: function() {
                    var shownTitleList, hiddenTitleList;
                    hiddenTitleList = $('.DonationCaptureFormTable select[id*="Title"]').children().clone();
                    shownTitleList = '.donorTitle select#nameTitleList';
                    if ($('select#nameTitleList option').length === 0) {
                        $(hiddenTitleList).prependTo(shownTitleList);
                    }
                    $('#nameTitleList option:eq(0)').text('Title');
                    $('select#nameTitleList option').click(function() {
                        $('select#nameTitleList option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');
  
                    });
                    // Match Selected Fund to Hidden Fund
                    $(shownTitleList).on('change', function() {
                        var shownTitleListSelected = $('select#nameTitleList option:selected');
                        var hiddenTitleList = '.DonationCaptureFormTable select[id*="Title"]';
                        $(hiddenTitleList).find('option[value="' + shownTitleListSelected.val() + '"]').attr('selected', true);
                    });
                },
                // STEP 2D: GET BILLING City
                billingCity: function() {
                    var billingCity, hiddenCity;
                    billingCity = '.wrapCity #billingCity';
                    hiddenCity = '.billingInfo [id*="City"]';
                    // Get City entered
                    $(billingCity).blur(function() {
                        var billingCityEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenCity).val(billingCityEnt);
                        }
                    });
                },
                // STEP 2E: GET BILLING COUNTRY
                billingCountryList: function() {
                    var shownCountryList, hiddenCountryList;
                    hiddenCountryList = $('.DonationCaptureFormTable [id*="Country"]').children().clone();
                    shownCountryList = 'select#billingCountry';
  
                    if ($('select#billingCountry option').length === 0) {
                        $(hiddenCountryList).prependTo(shownCountryList);
                    }
                    /*
                    $('select#billingCountry option').click(function () {
                    $('select#billingCountry option:selected').removeAttr('selected', true);
                    $(this).attr('selected', true);
                    $(hiddenCountryList).find('option[value="' + $(this).val() + '"]')
                    .attr('selected', true);
                    $('.DonationCaptureFormTable [id*="Country"] option').trigger('change');
  
                              });
                    */
  
                    // Match Selected Fund to Hidden Fund
                    $('select#billingCountry option').click(function() {
                        var shownCountryListSelected = $('select#billingCountry option:selected');
                        var hiddenCountryList = '.DonationCaptureFormTable [id*="Country"]';
                        $(hiddenCountryList).find('option[value="' + shownCountryListSelected.val() + '"]')
                            .attr('selected', true);
                        var hiddenCountrySelected = $('.DonationCaptureFormTable [id*="Country"]').find('option:selected');
                        // $(hiddenCountrySelected).trigger('change');
                        // console.log(hiddenCountrySelected);
                    });
                },
                // STEP 2F: GET BILLING STATE
                billingStateList: function() {
                    var shownStateList, hiddenStateList;
                    hiddenStateList = $('.DonationCaptureFormTable [id*="State"]').children().clone();
                    shownStateList = 'select#billingState';
                    if ($('select#billingState option').length === 0) {
                        $(hiddenStateList).prependTo(shownStateList);
                    }
                    $('#billingState option:eq(0)').text('State');
                    $('select#billingState option').click(function() {
                        $('select#billingState option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');
                    });
                    // Match Selected State to Hidden State
                    $(shownStateList).on('change', function() {
                        var shownStateListSelected = $('select#billingState option:selected');
                        var hiddenStateList = '.DonationCaptureFormTable [id*="State"]';
                        $(hiddenStateList).find('option[value="' + shownStateListSelected.val() + '"]').attr('selected', true);
                    });
                },
                // STEP 2G: GET BILLING ZIP
                billingZip: function() {
                    var billingZip, hiddenZip;
                    billingZip = '.wrapZip #zip';
                    hiddenZip = '.DonationFormTable [id*="Zip"]';
                    // Grab ZIP entered
                    $(billingZip).blur(function() {
                        var billingZipEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenZip).val(billingZipEnt);
                        }
                    });
                },
                // STEP 2H: GET BILLING PHONE
                billingPhone: function() {
                    var billingPhone, hiddenBillingPhone;
                    billingPhone = '.personalInfoList #billingPhone';
                    hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                    // Grab Phone value
                    $(billingPhone).blur(function() {
                        var billingPhoneEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingPhone).val(billingPhoneEnt);
                        }
                    });
                },
                // STEP 2I: GET BILLING EMAIL
                billingEmail: function() {
                    var billingEmail, hiddenBillingEmail;
                    billingEmail = '.personalInfoList #email';
                    hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                    // Grab Email value
                    $(billingEmail).blur(function() {
                        var billingEmailEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingEmail).val(billingEmailEnt);
                        }
                    });
                },
            },
  
            /**********************************************
            Step 3 - PAYMENT INFO HANDLER
            ***********************************************/
  
            stepThreePaymentInfo: {
  
                // PART 3A:
                // GET CARDHOLDER NAME AND VALIDATE ON KEYUP
                cardholder: function() {
                    var cardholder, hiddenCardholder;
                    cardholder = '.paymentInfo #cardholder';
                    hiddenCardholder = '.paymentInfo [id*="txtCardholder"]';
                    // Get Cardholder Name entered
                    $(cardholder).keyup(function() {
                        var cardHolderEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenCardholder).val(cardHolderEnt);
                        }
                    });
                },
  
                // PART 3B:
                // GET CARD NUMBER, VALIDATE, AND UPDATE CLASS
                cardNumber: function() {
                    var cardNumber, hiddenCardNumber, cardTypeEnt, creditCardValidator, cardTypeVisa, cardTypeMasterCard, cardTypeAmEx, cardTypeDiscover, cardTypeInvalid, cardType;
                    cardNumber = '.paymentInfo #cardNumber';
                    hiddenCardNumber = 'table.DonationFormTable input[id*="txtCardNumber"]'; // RegEx Cardnumber Pattern
                    creditCardValidator = new RegExp(/^\d{4}-?\d{4}-?\d{4}-?\d{3,4}$/); // Visa Card Type
                    cardTypeVisa = new RegExp(/^4$/); // MasterCard Card Type
                    cardTypeMasterCard = new RegExp(/^5$/); // American Express Card Type
                    cardTypeAmEx = new RegExp(/^3$/); // Discover Card Type
                    cardTypeDiscover = new RegExp(/^6$/); // Invalid Card Type
                    cardTypeInvalid = new RegExp(/^(0|1|2|7|8|9)$/); // Dynamic text of card type selected
                    cardType = '.cardTypeEnt';
                    cardTypeEnt = $(cardType).text(); // Get Card Number entered
  
                    // Match Number to CardType on Keyup
                    $(cardNumber).keyup(function() {
                        // console.log("cardNumber keyup");
                        if ($(this).val().match(cardTypeVisa)) {
                            $(this).removeClass().addClass('cardTypeVisa');
                            $(cardType).html('Visa');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(Visa)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeMasterCard)) {
                            $(this).removeClass().addClass('cardTypeMasterCard');
                            $(cardType).html('MasterCard');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(MasterCard)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeAmEx)) {
                            $(this).removeClass().addClass('cardTypeAmEx');
                            $(cardType).html('American Express');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(American)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeDiscover)) {
                            $(this).removeClass().addClass('cardTypeDiscover');
                            $(cardType).html('Discover');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(Discover)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeInvalid) || $(this).val() === '') {
                            $(this).removeClass().addClass('cardTypeInvalid');
                            $('.cardTypeEnt').text('');
                        }
                    });
                    $('.cardTypeEnt').text(cardTypeEnt); // Get Card Type Based on Card Number
  
                    // Grab Credit Card value
                    $(cardNumber).keyup(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if ($(this).val().match(creditCardValidator)) {
                            $(this).removeClass('invalid').addClass('valid');
                            $('input[id*="DonationCapture1_txtCardNumber"]').val(cardNumEnt);
                        } else {
                            $(this).removeClass('valid').addClass('invalid');
                        }
                    });
  
                    // Validate and Update Class
                    $(cardNumber).blur(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if ($(this).val().match(creditCardValidator)) {
                            $(this).removeClass('invalid').addClass('valid');
                            $('input[id*="DonationCapture1_txtCardNumber"]').val(cardNumEnt);
                        } else {
                            $(this).removeClass('valid').addClass('invalid');
                        }
                    });
  
                },
  
                // PART 3C:
                // CARD EXPIRATION HANDLER
                cardExp: function() {
                    var cardExpMonth, cardExpYear, hiddenCardExpMonth, hiddenCardExpYear, hiddenCardExpMonthClone, hiddenCardExpYearClone; // Card Expiration Month
                    cardExpMonth = 'select#cardExpMonth'; // Card Expiration Year
                    cardExpYear = 'select#cardExpYr'; // Hidden Exp Month
                    hiddenCardExpMonth = 'table.DonationFormTable select[id*="cboMonth"]'; // Hidden Exp Year
                    hiddenCardExpYear = 'table.DonationFormTable select[id*="cboYear"]'; // Clone Hidden Exp Month
                    hiddenCardExpMonthClone = $(hiddenCardExpMonth).children().clone(); // Clone Hidden Exp Year
                    hiddenCardExpYearClone = $(hiddenCardExpYear).children().clone(); // Build Card Exp Year Select list Options
                    if ($('select#cardExpMonth option').length === 0) {
                        $(hiddenCardExpMonthClone).appendTo('select#cardExpMonth');
                        $('select#cardExpMonth option:eq(0)').text('Month');
                    }
  
                    // Grab Card Exp Month
                    $(cardExpMonth).change(function() {
                        var cardExpMonthSelected = $('select#cardExpMonth :selected').val();
                        $(hiddenCardExpMonth).find('option:contains("' + cardExpMonthSelected + '")').attr('selected', 'selected');
                    });
  
                    // Grab Hidden Values and Append to this Dropdown
                    if ($('select#cardExpYr option').length === 0) {
                        $(hiddenCardExpYearClone).appendTo('select#cardExpYr');
                        $('select#cardExpYr option:eq(0)').text('Year');
                    }
  
                    // Grab Card Exp Year
                    $(cardExpYear).change(function() {
                        var cardExpYearSelected = $('select#cardExpYr :selected').val();
                        $(hiddenCardExpYear).find('option:contains("' + cardExpYearSelected + '")').attr('selected', 'selected');
                        // console.log('Year selected');
                    });
                },
  
                // PART 3D:
                // EXTRACT ALL CSC VALUES
                cardCSC: function() {
                    var cardSecCode, cscValidator, hiddenCardSecurityCode;
                    cardSecCode = 'input#cscCode'; // Card Security Code
                    cscValidator = new RegExp(/^\d{3,4}$/); // CSC Validation RegEx Pattern
                    hiddenCardSecurityCode = 'table.DonationFormTable input[id*="txtCSC"]'; // Hidden/Old Form Vars
  
                    // Validate CSC Field and Update Class
                    $(cardSecCode).blur(function() {
                        var cscEnt = $(cardSecCode).val();
                        if (!$(this).val().match(cscValidator)) {
                            $(this).addClass('invalid');
                        } else {
                            $(this).removeClass('invalid').addClass('valid');
                            $(hiddenCardSecurityCode).val(cscEnt);
                            //$('.paymentInfo ul.paymentInfo li[class*="card"]').addClass('siblingsComplete');
                            $('.paymentInfo h3').addClass('complete');
                        }
                    });
                },
  
                // PART 6: STORE HIDDEN DATA AND UPDATE IF NEEDED
                hiddenDataPersistence: function() {
                    var error = $('div[id$=ValidationSummary1]');
                    if (error.children().length > 0) {
                        var billingFirstName = '.donorFirstName #billingFirstName';
                        var hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                        var hiddenFirstNameEnt = $(hiddenFirstName).val();
                        $(billingFirstName).val(hiddenFirstNameEnt);
                        var billingLastName = '.donorLastName #billingLastName';
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var hiddenLastNameEnt = $(hiddenLastName).val();
                        $(billingLastName).val(hiddenLastNameEnt);
                        var billingAddress = '.personalInfoList #billingAddress';
                        var hiddenBillingAddress = 'textarea[id$="AddressLine"]';
                        var hiddenAddressEnt = $(hiddenBillingAddress).val();
                        $(billingAddress).val(hiddenAddressEnt);
                        var billingCity = '.wrapCity #billingCity';
                        var hiddenCity = 'input[id$="CityUS"]';
                        var hiddenCityEnt = $(hiddenCity).val();
                        $(billingCity).val(hiddenCityEnt);
                        var billingZip = '.wrapZip #zip';
                        var hiddenZip = 'input[id$="ZipUS"]';
                        var hiddenZipEnt = $(hiddenZip).val();
                        $(billingZip).val(hiddenZipEnt);
                        var billingPhone = '.personalInfoList #billingPhone';
                        var hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                        var hiddenPhoneEnt = $(hiddenBillingPhone).val();
                        $(billingPhone).val(hiddenPhoneEnt);
                        var billingEmail = '.personalInfoList #email';
                        var hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                        var hiddenEmailEnt = $(hiddenBillingEmail).val();
                        $(billingEmail).val(hiddenEmailEnt);
                    }
                },
  
                autoFillExtraction: function() {
  
                    // CHECK IF DESIGNATION PRESENT
                    var designationCheck = $('span[id$=DesignationValue]').text();
                    $("#fundDesignList").append($('<option>', {
                        value: designationCheck
                    }).text(designationCheck));
  
                    // PART 7: EXTRACT ALL VALUES
                    $('input#cscCode').blur(function() {
                        var billingFirstName = '.donorFirstName #billingFirstName';
                        var hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                        var billingFirstNameEnt = $(billingFirstName).val();
                        $(hiddenFirstName).val(billingFirstNameEnt);
                        var billingLastName = '.donorLastName #billingLastName';
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var billingLastNameEnt = $(billingLastName).val();
                        $(hiddenLastName).val(billingLastNameEnt);
                        var billingAddress = '.personalInfoList #billingAddress';
                        var hiddenBillingAddress = '.billingInfo [id*="AddressLine"]';
                        var billingAddressEnt = $(billingAddress).val();
                        $(hiddenBillingAddress).val(billingAddressEnt);
                        var billingCity = '.wrapCity #billingCity';
                        var hiddenCity = '.billingInfo [id*="City"]';
                        var billingCityEnt = $(billingCity).val();
                        $(hiddenCity).val(billingCityEnt);
                        var billingZip = '.wrapZip #zip';
                        var hiddenZip = '.DonationFormTable [id*="Zip"]';
                        var billingZipEnt = $(billingZip).val();
                        $(hiddenZip).val(billingZipEnt);
                        var billingPhone = '.personalInfoList #billingPhone';
                        var hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                        var billingPhoneEnt = $(billingPhone).val();
                        $(hiddenBillingPhone).val(billingPhoneEnt);
                        var billingEmail = '.personalInfoList #email';
                        var hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                        var billingEmailEnt = $(billingEmail).val();
                        $(hiddenBillingEmail).val(billingEmailEnt);
                    });
                },
                submitButton: function() {
                    $('.DonationButtonCell input[type="submit"].DonationSubmitButton').prependTo('.submitButton');
                },
  
            }, // END STEP 3 PAYMENT INFO
  
            /* Animate Step Here */
            stepOneToggleAnimations: function() {
                $('.donateAmount h3').addClass('complete');
                $('.donorInfo .personalInfoList').removeClass('hide').slideDown();
                $('.donorInfo').find('h3').removeClass();
                $('#billingFirstName').focus();
            },
  
            stepToggles: function() {
                $('#wrapSingleGivingForm .givingAmountOptions .rdoAmount input[type="radio"]').click(function() {
                    if ($(this).is(':checked') && $('ul.giftType').length === 0) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $('#wrapSingleGivingForm .givingAmountOptions .otherAmount input[type="text"]').blur(function() {
                    if ($(this).val() !== '' && $('ul.giftType').length === 0) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $('#wrapSingleGivingForm .giftType li input[type="checkbox"]').click(function() {
                    if ($(this).is(':checked')) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                /* STEP 3 HIDDEN Here */
                $('input#email[type="email"]').keyup(function() {
                    var emailValidator = new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
                    if ($(this).val().match(emailValidator)) {
                        $('.paymentInfo').removeClass('hide').slideDown();
                        $('.donorInfo').find('h3').addClass('complete');
                        $('.paymentInfo').find('h3').removeClass();
                        //$('#cardholder').focus();
                    }
                });
                if ($('body').hasClass('Explorer')) {
                    $('.personalInfoList input#email').keyup(function() {
                        var emailValidator = new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
                        if ($(this).val().match(emailValidator)) {
                            $('.paymentInfo').removeClass('hide').slideDown();
                            $('.donorInfo').find('h3').addClass('complete');
                            $('.paymentInfo').find('h3').removeClass();
                            //$('#cardholder').focus();
                        }
                    });
                }
            },
  
            hiddenFormValidation: function() {
                // Form Error(s) Text
                $('#wrapSingleGivingForm + [id*="UpdatePanel"] .DonationFormTable [id*="ValidationSummary1"].DonationValidationSummary').insertBefore('.donateAmount');
                // Form Submitted Text
                var forSubmittedText = $('[id*="lblThanks"].DonationMessage').insertBefore('.donateAmount');
                if ($(forSubmittedText).length) {
                    $('fieldset.step').hide();
                }
  
            },
  
        }, // END CUSTOM SINGLE DONATION
  
        resetBackgrounds: function() {
            $('.wrapBreadcrumbs p img').show();
            $("#internalPage .inner-wrap .siteWrapper .fullWidthBackgroundImage").removeAttr("style");
            BBI.Methods.foundationbgFix();
        }
  
    }
  };
  
  // If fund has been added to Gifts Summary, ask user if they are OK losing data upon reload.
  const onConfirmRefresh = function(event) {
    event.preventDefault();
    return event.returnValue = "Are you sure you want to leave the page?";
  }
  
  window.addEventListener("beforeunload", onConfirmRefresh, {
    capture: true
  });
  
  // Run global scripts...
  BBI.Methods.pageInit();
  
  // reset the backgrounds when the screen width changes
  var $window = $(window);
  var lastWindowWidth = $window.width();
  
  $window.resize(function() {
        /* Do not calculate the new window width twice.
        * Do it just once and store it in a variable. */
        var windowWidth = $window.width();

        /* Use !== operator instead of !=. */
        if (lastWindowWidth !== windowWidth) {
            // EXECUTE YOUR CODE HERE
            BBI.Methods.resetBackgrounds();
            lastWindowWidth = windowWidth;
        }

        // var designationCategoriesWidth = $(".designation-categories").width(),
        //     categorySelectWidth = $(".category-select span.select2").width(),
        //     designationSelectWidth = $(".designation-select span.select2").width();

        // if (designationCategoriesWidth != categorySelectWidth || designationCategoriesWidth != designationSelectWidth) {
        //     $(".category-select span.select2, .designation-select span.select2").width(designationCategoriesWidth + "px");
        // }
  });
  
  // document.write('<scr'+'ipt src="/file/web-dev/jquery.bxslider.min.js"></scr'+'ipt>');
  
  // Case insensitive version of ':contains()'
  jQuery.expr[':'].Contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0
  };
  
  // Make it safe to use console.log always
  window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        arguments.callee = arguments.callee.caller;
        var a = [].slice.call(arguments);
        (typeof console.log === "object" ? log.apply.call(console.log, console, a) : console.log.apply(console, a))
    }
  };
  (function(b) {
    function c() {}
    for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","), a; a = d.pop();) {
        b[a] = b[a] || c
    }
  })((function() {
    try {
        console.log();
        return window.console;
    } catch (err) {
        return window.console = {};
    }
  })());
