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
 Environment: PRODUCTION
--------------------------------------------------------------------
 Changelog:
====================================================================
 07/23/2015  Nick Fogle - Updated Alumni site root path for API calls
 07/29/2015  Nick Fogle - Refactored Plugin Functions
 11/08/2019 Greg Vissing - Launched website with new design
 11/27/2019 Greg Vissing - Launched redesign giving page(Methods added: populateAreasToSupportFields)
 01/28/2020 Greg Vissing - Separate Advanced Custom Fields methods from rest of site
 09/21/2020 Greg Vissing - Remove unecessary Methods from giveto.uc.edu
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
            errormsg: "",
            date: true,
            dateformat: "default",
            titletag: "h4",
            content: true,
            snippet: true,
            snippetlimit: 120,
            linktarget: "_self",
        };
        // extend options
        var options = $.extend(defaults, options);
        // return functions
        return this.each(function(i, e) {
            var s = "";
            // Check for SSL protocol
            if (options.ssl) {
                s = "s";
            }
            // add class to container
            if (!$(e).hasClass("rssFeed")) {
                $(e).addClass("rssFeed");
            }
            // check for valid url
            if (url === null) {
                return false;
            }
            // create yql query
            var query =
                "http" +
                s +
                "://query.yahooapis.com/v1/public/yql?q=" +
                encodeURIComponent(
                    'select * from feed where url="' + url + '"'
                );
            if (options.limit !== null) {
                query += " limit " + options.limit;
            }
            query += "&format=json";
            // send request
            $.getJSON(query, function(data, status, errorThrown) {
                // if successful... *
                if (status === "success") {
                    // * run function to create html result
                    process(e, data, options);
                    // * optional callback function
                    if ($.isFunction(fn)) {
                        fn.call(this, $(e));
                    }
                    // if there's an error... *
                } else if (status === "error" || status === "parsererror") {
                    // if showerror option is true... *
                    if (options.showerror) {
                        // variable scoping (error)
                        var msg;
                        // if errormsg option is not empty... *
                        if (options.errormsg !== "") {
                            // * assign custom error message
                            msg = options.errormsg;
                            // if errormsg option is empty... *
                        } else {
                            // * assign default error message
                            msg = errorThrown;
                        }
                        // * display error message
                        $(e).html(
                            '<div class="rssError"><p>' + msg + "</p></div>"
                        );
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
        var html = "";
        var htmlObject;
        // for each entry... *
        $.each(entries, function(i) {
            // * assign entry variable
            var entry = entries[i];
            var months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            var pubDate;
            var titlelink = entry.title.replace(/[^\w\s]/gi, "");
            var categoryClasses =
                " " +
                entry.categories
                .toString()
                .replace(/ &amp; /g, " ")
                .replace(/ /g, "-")
                .replace(/,/g, " ");
            // if date option is true... *
            if (entry.pubDate) {
                // * create date object
                var entryDate = new Date(entry.pubDate);
                // * select date format
                if (options.dateformat === "default") {
                    pubDate =
                        (entryDate.getMonth() + 1).toString() +
                        "/" +
                        entryDate.getDate().toString() +
                        "/" +
                        entryDate.getFullYear();
                } else if (options.dateformat === "spellmonth") {
                    pubDate =
                        months[entryDate.getMonth()] +
                        " " +
                        entryDate.getDate().toString() +
                        ", " +
                        entryDate.getFullYear();
                } else if (options.dateformat === "localedate") {
                    pubDate = entryDate.toLocaleDateString();
                } else if (options.dateformat === "localedatetime") {
                    pubDate =
                        entryDate.toLocaleDateString() +
                        " " +
                        entryDate.toLocaleTimeString();
                }
            }
            // * build entry
            html +=
                '<div class="storyTileOuterWrapper"><div class="storyTileInnerWrapper" data-tag="' +
                tags +
                '">';
            html +=
                '<div class="storyTileTextWrapper"><div class="storyTileTitle"><' +
                options.titletag +
                '><a href="' +
                entry.link +
                '" title="View this feed at ' +
                entries.title +
                '">' +
                entry.title +
                "</a></" +
                options.titletag +
                ">";
            if (options.date && pubDate) {
                html += '<div class="storyTileDate">' + pubDate + "</div>";
            }
            // if content option is true... *
            if (options.content) {
                var content = entry.description;
                html +=
                    '<div class="storyTileDescription">' + content + "</div>";
            }
            html += "</div>";
        });
        // provisional html result
        htmlObject = $(html);
        htmlObject.find(".storyTileInnerWrapper").each(function() {
            $(this).prepend('<div class="storyTileImage">');
            $(this)
                .find(".storyTileImage")
                .prepend(
                    $(this)
                    .find("img")
                    .first()
                );
        });
        $(e).append(htmlObject);
        // Apply target to links
        $("a", e).attr("target", options.linktarget);
    };
})(jQuery);
var bbpage = Sys.WebForms.PageRequestManager.getInstance();
var BBI = BBI || {
    Config: {
        version: 1.0,
        updated: "12/22/2015 4:30 PM",
        isEditView: !!window.location.href.match("pagedesign"),
        slideshowRan: false,
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
        // designationQueryId: "d968555d-dea8-4c1a-9b5c-4e3be2d750be",
        // this should be set the GUID of the designation query that returns highlighted areas
        highlightedFundsQueryId: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "bcafe634-adaa-4b72-b79d-ed16fc18bc8f";
            } else {
                return "c22e7fbb-abcb-4aed-acb2-b18f8639f77e";
            }
        })(),
        highlightedUcgniFundsQueryId: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "bcafe634-adaa-4b72-b79d-ed16fc18bc8f";
            } else {
                return "dcb9afbd-8cc0-4dc5-990f-24716779c18d";
                // return "c22e7fbb-abcb-4aed-acb2-b18f8639f77e";
            }
        })(),
        // the funds to be included in the cascading dropdown
        cascadingFundsQueryId: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "d54d11f0-3f9c-4d63-91a8-fecf1f06944c";
            } else {
                return "dcb9afbd-8cc0-4dc5-990f-24716779c18d";
            }
        })(),
        // the funds to be included in the cascading dropdown
        advancedDonationFormFundsQueryId: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "d54d11f0-3f9c-4d63-91a8-fecf1f06944c";
            } else {
                return "b0e28c08-4081-4328-91f5-8509243f5d79";
                // return "612a82e8-24c8-4ae1-9aee-d5a006750507";
            }
        })(),
        guidQueryID: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "d54d11f0-3f9c-4d63-91a8-fecf1f06944c";
            } else {
                return "612a82e8-24c8-4ae1-9aee-d5a006750507";
            }
        })(),
        // this should be set to the GUID of the Fund that greatest need gifts are applied to
        greatestNeedFund: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "898c3603-1440-4b38-9145-19d79effeb2c";
            } else {
                return "7318410e-17bd-4d1f-8437-d5742754a93a";
            }
        })(),
        // this should be set to the GUID of the pledge fund
        pledgeFund: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // this should be set to the GUID of the Fund that free text gifts are applied to
        generalFreeFormFund: (function() {
            if (
                BLACKBAUD.api.pageInformation.rootPath ===
                "https://www.alumni.uc.edu/"
            ) {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // GUID for membership fund
        // membershipFundId: "bcf8cd1a-0a22-4f2f-bd14-8040a272d6ed",
        // this should be set to the GUID of the Merchant account (unused - payment part)
        // MerchantAccountId: "864426b2-20a0-43aa-95f6-c850d757b026",
        newsFeedUrl: "https://foundation.uc.edu/feed.rss?id=1",
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
            "Pledge ID": "01d9e45d-533f-4759-ba10-07fd687a202c",
        },
        wantOrnament: "d4924bdf-f68c-4622-ac70-c9cbbaff1733",
        monthNames: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        titleTable: "456ffd4c-0fbf-49db-a503-0726f86e2a39",
        comments: "E3FE7CF0-7FFD-447A-979D-E73467EF94D6",
    },
    Methods: {
        pageInit: function() {
            //All functions which should run instantly
            BBI.Methods.menuToggles();
            BBI.Methods.pageFunctions();

            // Check to see if ADF
            if ($(".BBDonationApiContainer").length !== 0) {
                BBI.Methods.initADF();
                BBI.Methods.fundSearch();
                BBI.Methods.validationMarkers();

                // BBI.Methods.donationAmount();
                // BBI.Methods.initMobileHeader();
                // BBI.Methods.mobileSubMenu();
                // BBI.Methods.datePicker();
                // this.runOnDocumentReady();
            }
            //Style fixes in admin view
            if (BBI.Config.isEditView) {
                $("#mockup").addClass("edit-mode");
                BBI.Methods.adminStyleFixes();
            } else {
                // BBI.Methods.checkForIE();
                BBI.Methods.scrollToTop();
                // BBI.Methods.initADF();
                BBI.Methods.createMenuSVG();
                BBI.Methods.designationSearchFormat();
                BBI.Methods.designationSearchBoxes();
                BBI.Methods.donationAmount();
                BBI.Methods.coerStyles();
                BBI.Methods.initMobileHeader();
                BBI.Methods.mobileSubMenu();
                BBI.Methods.datePicker();

                BBI.Methods.urlParameterCheck();

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
                $("iframe[id*= twitter]").css("display", "inline-block");
            }
            //end instant functions
            //Runs on partial page refresh
            Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(
                function() {
                    BBI.Methods.pageRefresh();
                    BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
                    BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
                }
            );
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
            if (
                $(".mobileCanvas.show-for-small:visible").length &&
                $("tbody[id$=tbdForgotPWDUserName]").length
            ) {
                $(".leftCanvas").toggleClass(
                    "expanded",
                    1000,
                    "easeInOutQuart"
                );
                $(".rightCanvas").toggleClass(
                    "retracted",
                    1000,
                    "easeInOutQuart"
                );
            }
            // Hide New User Prompt if Already Signed In
            if (
                $(".mobileCanvas.show-for-small:visible").length &&
                $("input[id$=btnLogout]").length
            ) {
                $(".mobileCanvas .offcanvasReg").hide();
            }
        },
        pageLoad: function() {
            // Runs on full page load
            if (!BBI.Config.isEditView) {
                this.foundationMediaOverlay();
            }
            //add search placeholder
            $('#ucBand input[id*="_txtQuickSearch"]').attr(
                "placeholder",
                "Search UC"
            );
            $(".mobileCanvas .QuickSearchTextbox").prop(
                "placeholder",
                "Search UC Foundation"
            );
            // payment part 2.0 functions
            if ($(".PaymentPart_FormContainer").length > 0) {
                // remove payment part links
                $(".PaymentPart_CartCell.PaymentPart_CartDescriptionCell > a")
                    .contents()
                    .unwrap()
                    .wrap("<span></span>");
                //$(".PaymentPart_CartItemDetails:has('div')").prevAll().hide();
                // change "Other" designation text
                if (
                    $('.wrapButtons a:contains("Make Another Gift")').length ===
                    0
                ) {
                    var des = $(
                        ".PaymentPart_CartCell.PaymentPart_CartDescriptionCell"
                    ).find('span:contains("Other")');
                    if (des.length !== 0) {
                        $(des).text("Pledge Payment");
                    }
                }
            }
        },

        scrollToTop: function() {
            /* ==========================================================================
            			scrollTop

            	Options
            	var maxWidth = 767
            		========================================================================== */
            var maxWidth = 10000,
                minWidth = 0,
                scrollTrigger = 100,
                scrollButton = $("#scrollTop"),
                alwaysVisible = false,
                scrollTriggered = false,
                widthTriggered = false;
            /* ==========================================================================
              Events
              ========================================================================== */
            $(window).resize(function() {
                if ($(window).width() >= maxWidth && !widthTriggered) {
                    widthTriggered = true;
                    toggleDisplay();
                } else if ($(window).width() < maxWidth && widthTriggered) {
                    widthTriggered = false;
                    toggleDisplay();
                }
            });
            $(window).scroll(function() {
                if (
                    $(window).scrollTop() >= scrollTrigger &&
                    !scrollTriggered
                ) {
                    scrollTriggered = true;
                    toggleDisplay();
                } else if (
                    $(window).scrollTop() < scrollTrigger &&
                    scrollTriggered
                ) {
                    scrollTriggered = false;
                    toggleDisplay();
                }
            });
            scrollButton.on("click", function() {
                // Boolean to prevent double execution of the complete-property
                var scrollDone = false,
                    button = $(this);
                // CSS class for active state
                button.addClass("active");
                $("html, body").animate({
                    scrollTop: "0",
                }, {
                    duration: 800,
                    complete: function() {
                        if (!scrollDone) {
                            scrollDone = true;
                            button.removeClass("active");
                        }
                    },
                });
            });
            /* ==========================================================================
              Functions
              ========================================================================== */
            function toggleDisplay() {
                if (
                    $(window).width() < maxWidth &&
                    $(window).width() > minWidth &&
                    !alwaysVisible &&
                    scrollTriggered &&
                    !widthTriggered
                ) {
                    // If a correct maxWidth and minWidth is set
                    scrollButton.fadeIn();
                    // console.log(1);
                } else if (!maxWidth || minWidth >= maxWidth || alwaysVisible) {
                    // If values are wrong or alwaysVisible is true
                    scrollButton.fadeIn();
                    // console.log(2);
                } else {
                    // If no matches are found
                    scrollButton.fadeOut();
                    // console.log(3);
                }
            }
        },
        createMenuSVG: function() {
            $(".alumni #mainMenu .mainMenu .nccUlMenuSub2").each(function() {
                var height = $(this).height();
                var width = Math.floor(height / 10);
                $(this).append(
                    '<svg viewbox="0 0 ' +
                    width +
                    " " +
                    height +
                    '" height="' +
                    height +
                    '" width="' +
                    width +
                    '" style="position:absolute; top: 0; right: -' +
                    (width - 1) +
                    'px" ><polygon points="0,0 0,' +
                    height +
                    " " +
                    width +
                    ',0" style="fill:#de1c24;" /></svg>'
                );
            });
        },
        coerStyles: function() {
            if ($("#status-table").length !== 0) {
                $("#status-table").addClass("clearfix");
                $('span[id*="rptAttendeesDetails"]')
                    .not('[style], [id*="udpAttendees"]')
                    .parent("td, div.cell")
                    .addClass("labelTd");
                $('[id*="udpAttendees"]')
                    .parent("td, div.cell")
                    .addClass("mainTd");
                if ($(".mainTd").length > 1) {
                    $(".mainTd").css("width", "50%");
                    $(".mainTd")
                        .last()
                        .css("border-left", "1px solid #CCC")
                        .css("padding-left", "10px");
                    $("#divWizardButtons").css("max-width", "100%");
                }
            }
        },
        donationAmount: function() {
            var amountValue = BLACKBAUD.api.querystring.getQueryStringValue(
                "amount"
            );
            if (
                amountValue.length !== 0 &&
                $('.DonationFormTable input[id$="txtAmount"]').length !== 0
            ) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
            } else if (
                amountValue.length !== 0 &&
                $('#advancedDonationForm input[id$="txtAmount"]').length !== 0
            ) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
                $(".amountButton .selected").removeClass("selected");
                $("#adfOtherLabel").hide();
                $("#txtAmount")
                    .show()
                    .val(amountValue);
                var recurrTotal = $("#recurringTotal span").text();
                $(".adfTotalAmount span").html(recurrTotal);
                //$('.adfTotalAmount span').text(amountValue);
            }
        },
        foundationMediaOverlay: function() {
            // set the backgroundimage to show,
            // since the following code will hide if need be
            //$('.wrapBreadcrumbs p img').show();
            if ($("#internalPage .mediaBoxOverlay").length !== 0) {
                var parentDiv = $(".mediaBoxOverlay").closest(".container");
                if ($(window).width() > 768) {
                    // $('.mediaBoxOverlay').css('height', $('.mediaBoxOverlay').parent().height() - 30);
                }
                parentDiv.append('<i class="mediaBoxToggle">');
                $(".mediaBoxToggle").on("click", function() {
                    $(".mediaBoxOverlay").toggle({
                        effect: "scale",
                        direction: "both",
                        origin: ["bottom", "right"],
                    });
                    $(this).toggleClass("expanded");
                });
            } else if (
                $("#internalPage.alumni .wrapBreadcrumbs p img").length !== 0
            ) {
                var backgroundImage = $(".wrapBreadcrumbs p img");
                var backgroundImageURL = backgroundImage.attr("src");
                $(".fullWidthBackgroundImage").css({
                    "background-image": "url(" + backgroundImageURL + ")",
                    "background-position": "center top",
                });
                backgroundImage.closest("p").hide();
            } else if ($("#homePage .mediaBoxOverlay").length !== 0) {
                var backgroundImage = $(".wrapBreadcrumbs p img");
                var backgroundImageURL = backgroundImage.attr("src");
                $(".fullWidthBackgroundImage").css({
                    "background-image": "url(" + backgroundImageURL + ")",
                    "background-position": "center top",
                });
                backgroundImage.closest("p").hide();
            }
            if ($(".utilityMenus .offcanvasReg").length !== 0) {
                if ($('.utilityMenus a[id*="lbtnRegisterUser"]').length !== 0) {
                    $('.utilityMenus a[id*="lbtnRegisterUser"]').after(
                        $(".utilityMenus .offcanvasReg")
                    );
                }
                $('.utilityMenus table[id*="tbl"]').wrap(
                    '<div class="animatedReveal">'
                );
                $(".utilityMenus li.login a").on("click", function() {
                    if ($(this).hasClass("active")) {
                        $(this).removeClass("active");
                        $('.utilityMenus table[id*="tbl"]').hide(
                            "blind",
                            "slow"
                        );
                    } else {
                        $(this).addClass("active");
                        $('.utilityMenus table[id*="tbl"]').show(
                            "blind",
                            "slow"
                        );
                    }
                });
            }
        },
        menuToggles: function() {
            $(".leftCanvas .menuToggle").on("click", function(e) {
                e.preventDefault();
                $("#BodyId").toggleClass("menu-open");
                $(".leftCanvas").toggleClass("expanded");
                $(".rightCanvas").toggleClass("retracted");
                setTimeout(
                    function() {
                        $("#mobileLogo").toggleClass("expanded");
                    },
                    $("#mobileLogo").hasClass("expanded") ? 600 : 0
                );
            });
            $(".rightCanvas .menuToggle").on("click", function(e) {
                e.preventDefault();
                $("#BodyId").toggleClass("menu-open");
                $(".fa").toggleClass("fa-bars fa-close");
                $(this).toggleClass("open");
                $(".rightCanvas").toggleClass("expanded");
                $(".leftCanvas").toggleClass("retracted");
                setTimeout(
                    function() {
                        $("#mobileLogo").toggleClass("expanded");
                    },
                    $("#mobileLogo").hasClass("expanded") ? 600 : 0
                );
            });
        },
        pageFunctions: function() {
            $("input.SearchTextBox").attr("placeholder", "Search");

            var $div1 = $("#search");
            $(".search > a").on("click", function(e) {
                e.preventDefault();

                $div1.toggleClass("isOpen").slideToggle();
                var isOut = $div1.hasClass("isOpen");
                $div1.animate({ marginTop: isOut ? "" : "-55px" }, 300);
            });

            // ScrollTrigger.create({ start: 'top -80', end: 99999, toggleClass: { className: 'main-header--reduced', targets: '.main-header' } });

            var searchIcon = $('<svg class="searchIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.14 49.94"><g><path class="cls-1" d="M24.46,0A21.88,21.88,0,0,1,37.87,4.66c3.72,3,5.76,6.73,5.17,11.66a24.31,24.31,0,0,0,0,4.18c.24,4.74-1.9,8.31-5.54,11.05-5,3.75-10.68,4.84-16.77,4.3a15.07,15.07,0,0,1-3.41-.62c-1.12-.37-1.59,0-2.13,1-2.21,3.87-4.5,7.7-6.79,11.53a4.37,4.37,0,0,1-4.69,2.15A4.46,4.46,0,0,1,.09,46.3a4.78,4.78,0,0,1,.73-3.54C3.06,39,5.26,35.21,7.53,31.46a1.15,1.15,0,0,0-.19-1.71,11.19,11.19,0,0,1-3.55-7.86A68.13,68.13,0,0,1,4,13.08c.5-4.4,3.26-7.41,6.89-9.68C14.74,1,19,0,24.46,0Zm-2,25.8c6.28,0,11-1.67,14.18-4.63,4-3.74,4.14-9,.26-12.87A17.26,17.26,0,0,0,26.27,3.56C21,3,16,3.81,11.59,7c-5.7,4.13-5.82,10.62-.29,15A18.58,18.58,0,0,0,22.45,25.8Zm-4.53,6.05a.58.58,0,0,0,.22.12c6.27,1.39,12.17.65,17.45-3.22a9.58,9.58,0,0,0,3.76-5.42C33.09,28.81,25.9,30,18.24,28.74ZM15,29.78c-.29-.32-.61-.92-.89-.9a2,2,0,0,0-1.4.71c-3,4.91-5.88,9.85-8.81,14.78-.41.7-.72,1.45.14,2s1.35-.17,1.76-.85l8.64-14.6C14.65,30.6,14.79,30.27,15,29.78Zm-4-3.78L7.53,23.26l-.29.2,2.37,4.09Z"></path></g></svg>');
            $("#menu li.search span, button#srch_btn_v").prepend(searchIcon);

            // $("a[href^='#']").click(function (e) {
            // 	e.preventDefault();
            // 	var position = $($(this).attr("href")).offset().top;
            // 	$("body, html").animate(
            // 		{
            // 			scrollTop: position - 60
            // 		},
            // 		700
            // 	);
            // });	

            function headerHeight(element) {
                var headerHeightValue = element.outerHeight();
                // console.log("checked height");
                return headerHeightValue;
            }

            $("header").next().css("margin-top", headerHeight($("header")) + "px");

            // if ($(document).scrollTop() > 300) {
            // 	// $("header").addClass("reduced");
            // 	$(".scrollToTop").fadeIn();
            // }
        },
        designationSearchFormat: function() {
            if ($("span.designationInfoBoxOuter").length !== 0) {
                var desingationItems = $("span.designationInfoBoxOuter");
                for (var i = 0; i < desingationItems.length; i += 3) {
                    desingationItems
                        .slice(i, i + 3)
                        .wrapAll("<div style='clear:both'></div>");
                }
            }
        },
        getImagesFromFolder: function(folderPath, callback) {
            var jsonPath =
                BLACKBAUD.api.pageInformation.rootPath +
                "WebApi/Images/" +
                folderPath;
            $.getJSON(jsonPath, function(data) {
                callback(data);
            });
        },
        foundationGridImages: function(imageArray) {
            var imagePos = 0;
            var targets = $(".foundationCalendarGridImage:visible img");
            targets.each(function() {
                $(this).attr("src", imageArray[imagePos].Url);
                imagePos++;
            });
        },
        designationSearchBoxes: function() {
            if ($(".designationInfoBox").length != 0) {
                $(".designationInfoBox").each(function() {
                    var donationLink = $(this)
                        .find("hiddenData a")
                        .attr("href");
                    var systemID = $(this)
                        .find("hiddenData")
                        .text();
                    $(this)
                        .closest(".BBDesignationSearchResult")
                        .addClass("designationInfoBoxOuter");
                    $(this)
                        .find(".designationInfoBoxGiveButton")
                        .attr("href", donationLink);
                    $(this)
                        .find(".designationInfoBoxInfoButton")
                        .attr("href", donationLink);
                });
            }
        },
        initADF: function() {
            if ($("#donationForm").length !== 0) {

                BBI.Methods.fundList();
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.queryParameters();

                // character counter (comments)
                let commentsLength = $("textarea#comments").attr("maxLength"),
                    commentsTextArea = $("textarea#comments");

                var maxLength = commentsLength;
                commentsTextArea.keyup(function() {
                    var textlen = maxLength - $(this).val().length;
                    $('.char-counter span').text(textlen);
                });

                // Check for specific Appeal Code to Show Ornament field
                var checkAppealId = BBI.Methods.returnQueryValueByName("appeal");
                console.log(checkAppealId);
                if (checkAppealId == "570c2edf-c180-4f4f-8b27-4dcfc60c7699") {
                    console.log("true");
                    $("#ornament").css("display", "flex");
                } else {
                    console.log("false");
                    // do nothing
                }

                // $("#adfSubmitButton").on("click", function(e) {
                //     e.preventDefault();
                //     if (BBI.Methods.validateADF()) {
                //         $(this)
                //             .addClass("disabled")
                //             .unbind("click");
                //         BBI.Methods.gf2SubmitADF();
                //     }
                // });

                $("#toggleOtherFund").on("click", function() {
                    $(".toggleOtherFund").slideDown();
                    $("#otherArea").focus();
                })

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
                $("#startDate").datepicker("setDate", getMinDate());

                // submit button event
                $('#adfSubmitButton').on('click', function(e) {
                    // prevent default action
                    e.preventDefault();

                    // form validation
                    if ($('.fund-card.empty').is(':visible')) {
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p style="vertical-align: middle;display: inline-block !important;">Please select a fund from above and enter an amount.</p>');
                        $('#adfError').show();
                    } else if (BBI.Methods.validateADF()) {
                        // hide error
                        $('#adfError').hide();

                        // get donation data
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.getDonationData();
                        // var data = BBI.Methods.getDonationData();

                        // credit card or bill me later
                        // if (BBI.Defaults.editorContent && BBI.Defaults.editorContent.MACheckoutSupported && data.Gift.PaymentMethod === 0) {
                        //     BBI.Methods.processCCPayment(data);
                        // } else {
                        //     BBI.Methods.billMeLater(data);
                        // }
                    } else {
                        // reset error
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p>Some required information is missing. Form submission is disabled until all required information is entered.</p>');
                    }
                });

                $("html, body").animate({ scrollTop: "0" });

            }
        },

        fundList: function() {
            // fund list containers
            var fundList = $(".BBDonationApiContainer"),
                areaSupportSelect = $("#areaSupportSelect"),
                collegeUnitSelect = $("#collegeUnitSelect"),
                collegeUnitToggle = $(".collegeUnitToggle"),
                fundToggle = $(".fundToggle"),
                fundSelect = $("#fundSelect");

            // designation variables
            var query = new BLACKBAUD.api.QueryService(),
                results = [];

            // filter unique values
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            let areaToSupport = ["The UC Fund", "Scholarships", "UC Health", "Colleges/Units"];

            // get results
            query.getResults(BBI.Defaults.advancedDonationFormFundsQueryId, function(data) {

                // clean results
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];

                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });

                $.each(rows, function() {
                    var values = this.Values;
                    if (values[8]) {
                        results.push({
                            // name: values[0], // values[0].split("(")[0].trim()
                            name: values[1],
                            id: values[6],
                            cat: values[8],
                            subcat: values[9] // .substring(values[9].indexOf("-") + 1).trim()
                        });
                    }
                });

                var count = 0;
                $.each(areaToSupport, function(key1, value) {
                    // build html structure for categories
                    areaSupportSelect.append('<option value="' + value + '" class="des-cat cat-' + key1 + '">' + value + '</option>');
                    count++;
                    if (count == areaToSupport.length) {
                        BBI.Methods.hideQueryLoader();
                    }
                });

                // autopopulate designation from url
                var area = BBI.Methods.returnQueryValueByName("area"),
                    unit = BBI.Methods.returnQueryValueByName("unit");

                if (!!area) {

                    if (area == "scholarships") {
                        console.log("scholarships");
                        document.getElementById("areaSupportSelect").value = "Scholarships";
                        $("select#areaSupportSelect").trigger("change");
                    } else if (area == "ucfund") {
                        console.log("ucfund");
                        document.getElementById("areaSupportSelect").value = "The UC Fund";
                        $("select#areaSupportSelect").trigger("change");
                    } else if (area == "uchealth") {
                        console.log("uchealth");
                        document.getElementById("areaSupportSelect").value = "UC Health";
                        $("select#areaSupportSelect").trigger("change");
                    } else if (area == "college") {
                        console.log("college");
                        document.getElementById("areaSupportSelect").value = "Colleges/Units";
                        $("select#areaSupportSelect").trigger("change");
                        if (!!unit) {
                            $("select#collegeUnitSelect")
                                .find('option[value^="' + unit + '"]')
                                .prop("selected", true)
                                .trigger("change");
                        }
                    } else {
                        // do nothing
                    }

                }

            });

            // run fund selection
            BBI.Methods.fundCards();

            $(areaSupportSelect).on("change", function() {
                collegeUnitSelect.prop("selectedIndex", 0).find('option').not("option:first").remove();
                fundSelect.prop("selectedIndex", 0).find('option').not("option:first").remove();

                var selection = $(this).val();
                // filter categories based on selection
                var filterCat = $.grep(results, function(v) {
                    return v.cat === selection;
                });

                // get sub-categories from category filter
                var subCategory = filterCat.map(function(obj) {
                    return obj.subcat;
                });

                function Ascending_sort(a, b) {
                    return $(b)
                        .text().toUpperCase() < $(a)
                        .text().toUpperCase() ? 1 : -1;
                }

                // populate unique sub-categories
                var uniqueSubCat = subCategory.filter(onlyUnique);
                if (selection == "Colleges/Units") {
                    $(collegeUnitToggle).slideDown();
                    $(fundToggle).slideUp();

                    $.each(uniqueSubCat, function(key, value) {
                        var trimmedValue = value.substring(value.indexOf("-") + 1);
                        $(collegeUnitSelect).append($('<option value="' + value + '">' + trimmedValue + '</option>'));
                    });

                    var collegeUnitSelectVar = document.getElementById("collegeUnitSelect"),
                        fundSelectVar = document.getElementById("fundSelect");
                    collegeUnitSelectVar.disabled = false;
                    fundSelectVar.disabled = true;
                    collegeUnitSelectVar.setAttribute("selectedIndex", 0);

                    $(collegeUnitSelect).focus();
                    $("#collegeUnitSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("#collegeUnitSelect");
                } else if (selection == "Scholarships" || selection == "The UC Fund" || selection == "UC Health") {
                    $(collegeUnitToggle).slideUp();
                    $(fundToggle).slideDown();

                    $.each(filterCat, function(key, value) {
                        $(fundSelect).append(
                            $(
                                '<option data-cat="' + value.cat + '" data-subcat="' + value.subcat + '" value="' +
                                value.id +
                                '">' +
                                value.name.split("(")[0].trim() +
                                '</option>'
                            )
                        );
                    });

                    var collegeUnitSelectVar = document.getElementById("collegeUnitSelect"),
                        fundSelectVar = document.getElementById("fundSelect");
                    collegeUnitSelectVar.disabled = true;
                    fundSelectVar.disabled = false;
                    collegeUnitSelectVar.setAttribute("selectedIndex", 0);

                    $(fundSelect).focus();
                    $("#fundSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("#fundSelect");
                }
                // else if (selection == "Type your own fund") {
                //     $(".toggleOtherFund").slideDown();
                //     $("#otherArea").focus();

                //     var position = $($("#otherArea")).offset().top;
                //     $("body, html").animate({
                //             scrollTop: position - 60
                //         },
                //         700
                //     );
                // }
                else {
                    // do nothing
                }
            });

            // sub-category menu (level 2)
            $(collegeUnitSelect).on("change", function() {
                $(fundToggle).slideDown();

                // remove all options in designation menu except the first
                $(fundSelect).focus().prop("selectedIndex", 0).find("option").not("option:first").remove();

                // define category and sub-category selections
                var selection1 = $(areaSupportSelect).val();
                var selection2 = $(this).val();

                // filter designations based on category and sub-category selections
                var filterSubCat = $.grep(results, function(v) {
                    return v.cat === selection1 && v.subcat === selection2;
                });

                // populate designations
                $.each(filterSubCat, function(key, value) {
                    $(fundSelect).append(
                        $(
                            '<option data-cat="' + value.cat + '" data-subcat="' + value.subcat + '" value="' +
                            value.id +
                            '">' +
                            value.name.split("(")[0].trim() +
                            '</option>'
                        )
                    );
                });

                var fundSelectVar = document.getElementById("fundSelect");
                fundSelectVar.disabled = false;

                function Ascending_sort(a, b) {
                    return $(b)
                        .text().toUpperCase() < $(a)
                        .text().toUpperCase() ? 1 : -1;
                }

                $("#fundSelect option:not(:first)")
                    .sort(Ascending_sort)
                    .appendTo(fundSelect);
            });
        },

        // fund search
        fundSearch: function() {
            // typeahead variables
            var typeahead = $('#desSearch'),
                query = new BLACKBAUD.api.QueryService(),
                results = [];
            // data = BBI.Defaults.emergencyData;

            // console.log(data);

            // get results
            query.getResults(BBI.Defaults.advancedDonationFormFundsQueryId, function(data) {
                // clean results
                results = [];
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];

                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });

                $.each(rows, function() {
                    var values = this.Values;
                    results.push({
                        value: values[6],
                        label: values[0],
                        cat: values[8],
                        subcat: values[9]
                            // value: values[4],
                            // label: values[3],
                            // cat: values[1],
                            // subcat: values[2]
                    });
                });

                // initialize suggestion engine
                var search = new Bloodhound({
                    // datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label', 'cat', 'subcat'),
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: results,
                    sorter: function(a, b) {

                        //get input text
                        var InputString = $("#desSearch").val();

                        //move exact matches to top
                        if (InputString == a.value) { return -1; }
                        if (InputString == b.value) { return 1; }

                        //close match without case matching
                        if (InputString.toLowerCase() == a.value.toLowerCase()) { return -1; }
                        if (InputString.toLowerCase() == b.value.toLowerCase()) { return 1; }

                        if ((InputString != a.value) && (InputString != b.value)) {

                            if (a.value < b.value) {
                                return -1;
                            } else if (a.value > b.value) {
                                return 1;
                            } else return 0;
                        }
                    }
                });

                // initialize typeahead plugin
                var typeaheadInit = search.initialize();
                typeaheadInit.done(function() {
                    typeahead.typeahead({
                        highlight: true,
                        minLength: 2
                    }, {
                        display: 'label',
                        name: 'search',
                        source: search,
                        limit: 'Infinity',
                        templates: {
                            empty: function() {
                                return '<div class="no-match">No Results Found. <ol style="list-style:decimal;padding-left:1em;"><li>Please enter the fund name in the Comments section below.</li><li>Clear this box and search for the following fund: <strong>Other/Undesignated UCF (8U99999) fund</strong>.</li></ol></div>';
                            },
                            suggestion: function(data) {
                                var categoryText = "";

                                if (data.cat) {
                                    categoryText = data.cat + ' / ';
                                } else {
                                    // categoryText
                                }
                                return '<div><p class="tt-hierarchy">' + categoryText + data.subcat.substring(data.subcat.indexOf("-") + 1).trim() + '</p><p class="tt-label">' + data.label + '</div>';
                                // return '<div><p class="tt-hierarchy">' + data.cat + ' / ' + data.subcat + '</p><p class="tt-label">' + data.label + '</div>';
                            }
                        }
                    }).on('typeahead:select', function(e, datum) {
                        $(this).data({
                            value: datum.value,
                            label: datum.label,
                            cat: datum.cat,
                            subcat: datum.subcat,
                            id: datum.value + '-' + datum.label.replace(/(_|\W)/g, '').toLowerCase()
                        });
                        BBI.Methods.addFund($(this));
                        clearSearch();
                    }).on('typeahead:change', function() {
                        if ($.trim($(this).typeahead('val')) === '') {
                            clearSearch();
                        }
                    });
                }).fail(function() {
                    console.log('unable to parse designation query');
                });

                // clear search field
                function clearSearch() {
                    typeahead.typeahead('val', '').typeahead('close');
                    typeahead.removeData();
                }

                // autopopulate designation from url
                var guid = BBI.Methods.returnQueryValueByName('fund');
                if (!!guid) {
                    var label = results.filter(function(obj) {
                        return obj.value === guid;
                    })[0].label;
                    typeahead.data('value', guid).typeahead('val', label);
                }
            });

        },

        // fund card events
        fundCards: function() {
            // fund card event (blur)
            $('#giftSummary').on('blur', '.fund-card input', function() {
                if (!isNaN($(this).val())) {
                    if (Number($(this).val()) < 1.00) {
                        $(this).val('0.00');
                        if ($(this).next('.min-amount').length === 0) {
                            $(this).parent().append('<p class="min-amount">Please enter a minimum of $1.</p>');
                        }
                    } else {
                        if ($(this).next('.min-amount').length !== 0) {
                            $(this).next('.min-amount').remove();
                        }
                        var newVal = parseFloat($(this).val(), 10).toFixed(2);
                        $(this).val(newVal);
                        BBI.Methods.updateTotal();
                    }
                } else {
                    $(this).val('0.00');
                }
            });

            // fund card events (change keyup focusout input paste)
            $('#giftSummary').on('change keyup focusout input paste', '.fund-card input', function(e) {
                if (!isNaN($(this).val())) {
                    // update total amount
                    BBI.Methods.updateTotal();

                    // update pledge summary
                    // if ($('#pledgeGift').is(':checked')) {
                    //     BBI.Methods.pledgeSummary();
                    // }
                }
            });

            // remove fund
            $('#giftSummary').on('click', '.remove-fund', function(e) {
                e.preventDefault();
                var id = $(this).closest('.fund-card').data('id');

                var removeInComments = $(this).closest('.fund-card').find('.fund-name').text();
                // // var name = document.getElementById("name");
                // var textarea = $("#comments").val();
                // // var data = textarea.value;
                // textarea = textarea.replace(removeInComments, "");

                var oldComments = $('#comments').val();
                var newComments = oldComments.replace("Other Fund: " + removeInComments, "");
                $('#comments').val(newComments);

                // var commentsText = $("#comments").val(),
                //     remove = "Other Fund: " + removeInComments;

                // commentsText = commentsText.replace(remove, "");

                $('.des-select').find('#' + id).prop('checked', false);
                BBI.Methods.removeFund(id);

                // update pledge summary
                // if ($('#pledgeGift').is(':checked')) {
                //     BBI.Methods.pledgeSummary();
                // }
            });

            // remove fund
            $('.fundSelect').on('click', '.add-other', function(e) {
                e.preventDefault();

                if ($("#otherArea").val() != "") {
                    BBI.Methods.addFund($(this));
                } else {
                    alert("No fund name has been typed.");
                }

                // var id = $(this).closest('.fund-card').data('id');
                // $('.des-select').find('#' + id).prop('checked', false);
                // BBI.Methods.removeFund(id);

                // update pledge summary
                // if ($('#pledgeGift').is(':checked')) {
                //     BBI.Methods.pledgeSummary();
                // }
            });
        },

        // add to cart
        addFund: function(elem) {
            // hide empty card
            if ($('.fund-card.empty').is(':visible')) {
                $('.fund-card.empty').addClass('hidden');
            }

            // fund data
            var value, label, cat, subcat, id;
            if (elem.is('#desSearch')) {
                value = elem.data('value');
                label = elem.data('label');
                cat = elem.data('cat');
                subcat = elem.data('subcat');
                id = elem.data('id');

                // select corresponding checkbox in fund list
                $('.des-select').find('#' + id).prop('checked', true);
            } else if (elem.is('#fundSelect')) {
                value = $("#fundSelect option:selected").val();
                label = $("#fundSelect option:selected").text();
                cat = $("#fundSelect option:selected").data("cat");
                subcat = $("#fundSelect option:selected").data("subcat");
                id = $("#fundSelect option:selected").val();

                // value = elem.prev('input').val();
                // label = elem.text();
                // cat = elem.prev('input').data('cat');
                // subcat = elem.prev('input').data('subcat');
                // id = elem.prev('input').attr('id');
            } else if (elem.is('.add-other')) {
                value = $("#otherArea").data("guid");
                label = $("#otherArea").val();
                cat = "Other Fund";
                subcat = $("#otherArea").val();
                id = $("#otherArea").data("guid");

                $("#comments").val("Other Fund: " + label);
            }

            $("#otherArea").val("");

            // build fund card markup
            var card = $(
                '<div class="fund-card" data-id="' + id + '">' +
                '<div class="fund-card-header">' +
                '<p><span class="fund-cat">' + cat + '</span> / <span class="fund-subcat">' + subcat.substring(subcat.indexOf("-") + 1).trim() + '</span></p>' +
                '</div>' +
                '<div class="fund-card-block">' +
                '<div class="row">' +
                '<div class="g-5 t-g-2 relative remove-bottom"><p class="fund-name">' + label + '</p><p class="fund-guid hidden">' + value + '</p></div>' +
                '<div class="g-3 t-g-2 relative remove-bottom"><p class="symbol">$</p><input class="adfInput form-control required" type="text" placeholder="0.00" required></div>' +
                '</div>' +
                '</div>' +
                '<div class="fund-card-footer">' +
                '<a href="#" class="button remove-fund"><span class="fa fa-times"></span>&nbsp;&nbsp;Remove Gift</a>' +
                '</div>' +
                '</div>'
            );

            // insert fund card
            card.insertBefore('.proc-fee');

            // update total amount
            BBI.Methods.updateTotal();

            // update pledge summary
            // if ($('#pledgeGift').is(':checked')) {
            //     BBI.Methods.pledgeSummary();
            // }
        },

        // remove fund
        removeFund: function(id) {
            // remove card
            if (!!id) {
                $('.fund-card[data-id="' + id + '"]').remove();
            }

            // no funds
            if ($('.fund-card').not('.empty, .proc-fee').length === 0) {
                $('.fund-card.empty').removeClass('hidden');
            }

            // update total amount
            BBI.Methods.updateTotal();

            // update pledge summary
            if ($('#pledgeGift').is(':checked')) {
                BBI.Methods.pledgeSummary();
            }
        },

        // update total
        updateTotal: function() {
            // cart variables
            var cartTotal = $('.total-amount span'),
                total = 0,
                newTotal,
                formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });

            // update processing fee
            // if ($('#processingFee').is(':checked')) {
            //     BBI.Methods.updateProcessingFee();
            // } else {
            //     $('.fund-card.proc-fee input').val('');
            // }

            // update total amount
            $('.fund-card input').each(function() {
                var amount = Number($(this).val());
                total += +parseFloat(amount, 10).toFixed(2);
            }).promise().done(function() {
                newTotal = parseFloat(total, 10).toFixed(2);
                cartTotal.text(formatter.format(newTotal));
                
                if (newTotal >= "20.00") {
                    console.log("Over $20.00. " + newTotal); 
                    $("#wantOrnament").prop("disabled", "");
                } else {
                    console.log("Under $20.00");
                    $("#wantOrnament").prop("disabled", "disabled").prop("checked", "");
                }
                // var currencyAmount = formatter.format(newTotal);
                 
            });                      
        },

        hideQueryLoader: function() {
            $("#queryLoader").slideUp();
            $(".fundSelect").slideDown();
        },

        populateFundsInSequence: function(areaToSupport) {
            var collegeUnitDesignation = $("select#collegeUnitsSelect"),
                collegeUnitFundDesignation = $("select#collegeUnitsFundSelect");
            /* *************************************** */
            // QUERY FUNDS
            /* *************************************** */
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.advancedDonationFormFundsQueryId,
                function(data) {
                    var fields = data.Fields, // Column headers
                        rows = data.Rows, // Designation values
                        fieldArray = [],
                        fundMaster = [],
                        // typeaheadArr = [], // Typeahead array
                        collegesUnitsList = []; // New array to store key value pairs for Field Data
                    // Loop through headers to create key value index
                    $.each(fields, function(key, value) {
                        fieldArray[value.Name] = key;
                    });
                    var rowLength = data.Rows.length;
                    $.each(rows, function(index) {
                        var values = this.Values,
                            path = values[fieldArray["Path"]],
                            designationID =
                            values[fieldArray["System record ID"]],
                            designationName = values[fieldArray["Public name"]],
                            fundCategory =
                            values[
                                fieldArray[
                                    "BBIS Fund Category - Multi Attribute\\Value"
                                ]
                            ],
                            collegeUnitFundName =
                            values[fieldArray["Unit Attribute\\Value"]],
                            toggleHide = "";
                        if (fundCategory == areaToSupport) {
                            var target = values[1]; // Fund name [0]
                            var splitter = target.split("\\");
                            // remove first item in array
                            if (splitter.length > 1) {
                                splitter.shift();
                            }
                            // push values to array
                            splitter.push(values[4]); // Description 		subFund[1]
                            splitter.push(values[6]); // Designation GUID 	subFund[2]
                            splitter.push(values[9]); // College 			subFund[3]
                            splitter.push(values[8]); // Areas dropdowns 	subFund[4]
                            splitter.push(parseInt(values[7])); // Priority  subFund[5]
                            fundMaster.push(splitter);
                            if (areaToSupport == "The UC Fund") {
                                $("#ucFundSelect").append(
                                    '<option data-area="' +
                                    fundCategory +
                                    '" value="' +
                                    designationID +
                                    '">' +
                                    designationName +
                                    "</option>"
                                );
                            } else if (areaToSupport == "Scholarships") {
                                $("#scholarshipsSelect").append(
                                    '<option data-area="' +
                                    fundCategory +
                                    '" value="' +
                                    designationID +
                                    '">' +
                                    designationName +
                                    "</option>"
                                );
                            } else if (areaToSupport == "UC Health") {
                                $("#ucHealthSelect").append(
                                    '<option data-area="' +
                                    fundCategory +
                                    '" value="' +
                                    designationID +
                                    '">' +
                                    designationName +
                                    "</option>"
                                );
                            } else if (areaToSupport == "Colleges/Units") {
                                collegesUnitsList.push(collegeUnitFundName);
                            } else {}
                        }
                    });
                    var sortedFundMaster = fundMaster;

                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }
                    var topLevelUnique = collegesUnitsList.filter(onlyUnique),
                        collegeUnitsDropdown = topLevelUnique.sort();
                    $.each(collegeUnitsDropdown, function(key, value) {
                        var trimmedCollege = $.trim(
                            value.substring(value.indexOf("-") + 1)
                        );
                        $(collegeUnitDesignation).append(
                            $("<option></option>")
                            .val(value)
                            .text(trimmedCollege)
                        );
                    });

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text()
                            .toUpperCase() <
                            $(a)
                            .text()
                            .toUpperCase() ?
                            1 :
                            -1;
                    }
                    $("select#collegeUnitsSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("select#collegeUnitsSelect");

                    function multiDimensionalUnique(arr) {
                        var uniques = [];
                        var itemsFound = {};
                        for (var i = 0, l = arr.length; i < l; i++) {
                            var stringified = JSON.stringify(arr[i]);
                            if (itemsFound[stringified]) {
                                continue;
                            }
                            uniques.push(arr[i]);
                            itemsFound[stringified] = true;
                        }
                        return uniques;
                    }
                    var fundsUnique = multiDimensionalUnique(sortedFundMaster);
                    fundsUnique.sort(function(a, b) {
                        return a[5] - b[5];
                    });
                    // College/Units drop-down
                    $(collegeUnitDesignation).on("change", function() {
                        // define designation selection
                        var selection = $(this).val();
                        // console.log(selection);
                        // remove all options in sub drop-down except the first
                        $(collegeUnitFundDesignation)
                            .find("option")
                            .not("option:first")
                            .remove();
                        // loop through funds
                        $.each(fundsUnique, function(x, subFund) {
                            // append GUID if terminal
                            if (
                                subFund[3] === selection &&
                                subFund[4] == "Colleges/Units"
                            ) {
                                $(collegeUnitFundDesignation).append(
                                    $("<option></option>")
                                    .val(subFund[2])
                                    .text(subFund[0])
                                );
                            }
                        });
                    });
                }
            );
        },
        initGiftTypeMethod: function() {
            // GIFT TYPE
            var defaultType = $(".toggleGiftType input:checked").val();
            $("#hiddenType").val(defaultType);
            $(".toggleGiftType input").on("change", function() {
                // console.log($(this).val());
                var typeSelected = $(this).val();
                $("#hiddenType").val(typeSelected);
                $(
                        ".toggleAmounts .r-pill__item:not(.otherItem) input[type='radio']"
                    )
                    .parent()
                    .addClass("hide");
                $(
                    ".toggleAmounts .r-pill__item:not(.otherItem) input[type='radio'][id*=" +
                    typeSelected +
                    "]"
                ).each(function() {
                    $(this)
                        .parent()
                        .removeClass("hide");
                });
                if (typeSelected == "Pledge") {
                    $(
                        "fieldset.areaToggle, fieldset.additionalInfoToggle"
                    ).fadeOut();
                    $("#amountPledge100").prop("checked", true);
                    $("#hiddenAmount").val("100");
                } else {
                    $(
                        "fieldset.areaToggle, fieldset.additionalInfoToggle"
                    ).fadeIn();
                }
                if (typeSelected == "OneTime") {
                    $("#amountOneTime100").prop("checked", true);
                    $("#hiddenAmount").val("100");
                }
                if (typeSelected == "Monthly") {
                    $("#amountMonthly10").prop("checked", true);
                    $("#hiddenAmount").val("10");
                    var frequencyValue = $("#frequency")
                        .children("option:selected")
                        .val();
                    // console.log(frequencyValue);
                    $("#hiddenStartDate").val($("#startDate").val());
                    $("#hiddenFrequency").val(frequencyValue);
                } else {
                    $("#hiddenStartDate").val("");
                    $("#hiddenFrequency").val("");
                }
                $("fieldset.toggle").each(function() {
                    if ($(this).attr("id") === typeSelected + "GiftType") {
                        $("#" + typeSelected + "GiftType").show();
                    } else {
                        $(this).hide();
                    }
                });
            });
        },
        initAmountMethod: function() {
            // AMOUNT
            var defaultAmount = $(".toggleAmounts input:checked").val();
            $("#hiddenAmount").val(defaultAmount);
            $(".toggleAmounts input[type=radio]").on("change", function() {
                // console.log($(this).val());
                var donationAmount = $(this).val();
                if (donationAmount == "other") {
                    $(
                            ".r-pill__item.otherItem > input.miniInputText, .r-pill__item.otherItem .fa.fa-usd"
                        )
                        .fadeIn()
                        .focus();
                    $("#hiddenAmount").val("");
                } else {
                    $("input.miniInputText").val("");
                    $(
                        ".r-pill__item.otherItem > input.miniInputText, .r-pill__item.otherItem .fa.fa-usd"
                    ).hide();
                    $("#hiddenAmount").val(donationAmount);
                }
            });

            function setInputFilter(textbox, inputFilter) {
                [
                    "input",
                    "keydown",
                    "keyup",
                    "mousedown",
                    "mouseup",
                    "select",
                    "contextmenu",
                    "drop",
                ].forEach(function(event) {
                    textbox.addEventListener(event, function() {
                        if (inputFilter(this.value)) {
                            this.oldValue = this.value;
                            this.oldSelectionStart = this.selectionStart;
                            this.oldSelectionEnd = this.selectionEnd;
                        } else if (this.hasOwnProperty("oldValue")) {
                            this.value = this.oldValue;
                            this.setSelectionRange(
                                this.oldSelectionStart,
                                this.oldSelectionEnd
                            );
                        }
                    });
                });
            }
            setInputFilter(document.getElementById("txtAmount"), function(
                value
            ) {
                return /^-?\d*[.,]?\d{0,2}$/.test(value);
            });
            document.addEventListener(
                "DOMContentLoaded",
                function() {
                    document.querySelector(
                        ".miniInputText"
                    ).onkeyup = checkOtherAmount;
                },
                false
            );

            function checkOtherAmount(event) {
                // console.log($(this).val());
                var checkOtherAmountValue = $(this).val();
                $("#hiddenAmount").val(checkOtherAmountValue);
            }
        },
        initAddlInfoMethod: function() {
            function is_int(value) {
                if (parseFloat(value) == parseInt(value) && !isNaN(value)) {
                    return true;
                } else {
                    return false;
                }
            }

            function checkZipCode(event) {
                // console.log($(this).val());
                var el = $(this); // Did they type five integers?
                if (el.val().length == 5 && is_int(el.val())) {
                    // Call Ziptastic for information
                    $.ajax({
                        url: "https://zip.getziptastic.com/v2/US/" + el.val(),
                        cache: false,
                        dataType: "json",
                        type: "GET",
                        success: function(result, success) {
                            // $(".zip-error, .instructions").slideUp(200);
                            // console.log(el.val)
                            $("#ackCity, #hiddenackCity").val(result.city);
                            $("#ackState, #hiddenackState").val(result.state);
                            $("#ackCountry, #hiddenackCountry").val(
                                result.country
                            );
                            $(".ack-city-state").slideDown();
                            $("#ackPostalCode").blur();
                            $("#ackAddressLines")
                                .show()
                                .focus();
                        },
                        error: function(result, success) {
                            $(".zip-error").slideDown(300);
                        },
                    });
                } else if (el.val().length < 5) {
                    $(".zip-error").slideUp(200);
                }
            }
            document.addEventListener(
                "DOMContentLoaded",
                function() {
                    document.querySelector(
                        "#ackPostalCode"
                    ).onkeyup = checkZipCode;
                },
                false
            );
            // ADDITIONAL INFO
            $(".checkbox input[type='checkbox']").change(function() {
                // console.log(this.id);
                if (this.id == this.id && this.checked) {
                    $("#" + this.id + "Details").slideDown();
                } else if (this.id == this.id) {
                    $("#" + this.id + "Details").slideUp();
                    $("#" + this.id + "Details")
                        .find("input:text")
                        .val("");
                    $("#" + this.id + "Details")
                        .find("input:checkbox")
                        .prop("checked", false);
                    $("#" + this.id + "Details").find(
                        "select"
                    )[0].selectedIndex = 0;
                } else {}
            });
            $(".additionalInfoToggle input").on("keyup change", function() {
                var ackValue = $(this).val(),
                    ackID = $(this).attr("id");
                // console.log(ackID + " " + ackValue);
                $("#hidden" + ackID).val(ackValue);
            });
        },
        initReccurrenceMethod: function() {
            // RECURRENCE
            $("#frequency").on("change", function() {
                var frequencySelected = $(this).val();
                $("#hiddenFrequency").val(frequencySelected);
            });
        },
        initAreaToSupporteMethod: function() {
            // AREA TO SUPPORT
            var defaultArea = $(".areaSupportList input:checked").val();
            $("#hiddenArea").val(defaultArea);
            $("select").prop("selectedIndex", 0); // set all Select dropdowns to default option
            $(".areaSupportList input").on("change", function() {
                // console.log($(this).val());
                var areaSelected = $(this).val();
                $("#hiddenArea").val(areaSelected);
                if (areaSelected == "Colleges/Units") {
                    $(
                        "#collegesUnitsDropdown, #collegesUnitsFundsDropdown"
                    ).prop("selectedIndex", 0);
                    $(
                        "#collegesUnitsFundsDropdown option:not(:first)"
                    ).addClass("hide");
                    $("#collegesUnitsFundsDropdown option:first").text(
                        "-- Select College/Unit Fund --"
                    );
                    $(".areaSupportDD").addClass("hide");
                    $(".collegeUnitsDD").removeClass("hide");
                } else if (areaSelected == "Advanced Search") {
                    $(".areaSupportDD, .collegeUnitsDD").addClass("hide");
                    $("#advancedFundSearch").removeClass("hide");
                } else {
                    $("#designationAreaDropdown").prop("selectedIndex", 0);
                    $(".areaSupportDD").removeClass("hide");
                    $(".collegeUnitsDD").addClass("hide");
                    $("#designationAreaDropdown option:first").text(
                        "-- Select " + areaSelected + " to Support --"
                    );
                    $("#designationAreaDropdown option").each(function() {
                        var areaData = $(this).data("area");
                        if (areaSelected == areaData) {
                            $(this).removeClass("hide");
                        } else {
                            $(this).addClass("hide");
                        }
                    });
                }
            });
            $(".adfInputWithPlaceholder").on("change keyup", function() {
                var typedFund = $(this).val();
                if (typedFund != "") {
                    $("#hiddenFund").val(typedFund);
                    $("#hiddenGuid").val(
                        "6f0e4d60-1df1-495a-9e01-82b3e9d91aff"
                    );
                } else {
                    $("#hiddenFund").val("");
                    $("#hiddenGuid").val("");
                }
            });
            // COLLEGE/UNITS
            $("#collegesUnitsDropdown").on("change", function() {
                // console.log($(this).val());
                $("#collegesUnitsFundsDropdown").prop("selectedIndex", 0);
                var collegeSelected = $(this).val();
                var trimmedCollegeOption = $.trim(
                    collegeSelected.substring(collegeSelected.indexOf("-") + 1)
                );
                $("#collegesUnitsFundsDropdown option:first").text(
                    "-- Select " + trimmedCollegeOption + " Fund --"
                );
                $("#collegesUnitsFundsDropdown option").each(function() {
                    var collegeData = $(this).data("college");
                    if (collegeSelected == collegeData) {
                        $(this).removeClass("hide");
                    } else {
                        $(this).addClass("hide");
                    }
                });
            });
            $(".toggleOtherFund").click(function(e) {
                e.preventDefault();
                $("#advanced-search-fund").val("");
                $(this)
                    .next()
                    .slideDown();
            });
            $("#designationAreaDropdown, #collegesUnitsFundsDropdown").on(
                "change",
                function() {
                    var optionsText = this.options[this.selectedIndex].text,
                        optionsGuid = this.options[this.selectedIndex].value;
                    $("#hiddenFund").val(optionsText);
                    $("#hiddenGuid").val(optionsGuid);
                }
            );
        },
        populateGUID: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            // var ucFundDesignation = $("select#ucFundSelect");
            // var ucHealthDesignation = $("select#ucHealthSelect");
            // var scholarshipsDesignation = $("select#scholarshipsSelect");
            // var collegeUnitDesignation = $("select#collegeUnitsSelect");
            // var collegeUnitFundDesignation = $("select#collegeUnitsFundSelect");
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.guidQueryID,
                (fundCategory =
                    values[
                        fieldArray[
                            "BBIS Fund Category - Multi Attribute\\Value"
                        ]
                    ]),
                function(data) {
                    // fund data
                    var allFunds = data.Rows,
                        fundMaster = [],
                        topLevelAll = [],
                        typeaheadArr = [],
                        ucFundArr = [],
                        scholarshipsArr = [],
                        ucHealthArr = [];
                    // console.log(allFunds);
                    // remove all options in main drop-down except the first
                    // $(
                    // 		ucFundDesignation,
                    // 		scholarshipsDesignation,
                    // 		collegeUnitDesignation
                    // 	)
                    // 	.find("option")
                    // 	.not("option:first")
                    // 	.remove();
                    // get drop-down hierarchy and clean arrays
                    $.each(allFunds, function() {
                        // define values
                        var values = this.Values;
                        var target = values[1]; // Fund name [0]
                        var splitter = target.split("\\");
                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }
                        // push values to array
                        splitter.push(values[4]); // Description 		subFund[1]
                        splitter.push(values[6]); // Designation GUID 	subFund[2]
                        splitter.push(values[9]); // College 			subFund[3]
                        splitter.push(values[8]); // Areas dropdowns 	subFund[4]
                        splitter.push(parseInt(values[7])); // Priority  subFund[5]
                        fundMaster.push(splitter);
                        if (values[8] == "Colleges/Units") {
                            topLevelAll.push(values[9]);
                        } else if (values[8] == "The UC Fund") {
                            ucFundArr.push(splitter);
                        } else if (values[8] == "Scholarships") {
                            scholarshipsArr.push(splitter);
                        } else if (values[8] == "UC Health") {
                            ucHealthArr.push(splitter);
                        } else {}
                        var fundNameArr = values[1];
                        var fundGuidArr = values[6];
                        typeaheadArr.push(fundNameArr);
                    });
                    var sortedFundMaster = fundMaster.sort();
                    console.table(sortedFundMaster);
                }
            );
        },
        populateQueryServiceFunds: function() {
            /* *************************************** */
            // QUERY FUNDS
            /* *************************************** */
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.advancedDonationFormFundsQueryId,
                function(data) {
                    var fields = data.Fields, // Column headers
                        rows = data.Rows, // Designation values
                        fieldArray = [],
                        fundMaster = [],
                        typeaheadArr = [], // Typeahead array
                        collegesUnitsList = []; // New array to store key value pairs for Field Data
                    // Loop through headers to create key value index
                    $.each(fields, function(key, value) {
                        fieldArray[value.Name] = key;
                    });
                    var rowLength = data.Rows.length,
                        percentLoaded = 0;
                    $.each(rows, function(index) {
                        var values = this.Values,
                            path = values[fieldArray["Path"]],
                            designationID =
                            values[fieldArray["System record ID"]],
                            designationName = values[fieldArray["Public name"]],
                            fundCategory =
                            values[
                                fieldArray[
                                    "BBIS Fund Category - Multi Attribute\\Value"
                                ]
                            ],
                            collegeUnitFundName =
                            values[fieldArray["Unit Attribute\\Value"]],
                            toggleHide = "";
                        percentLoaded = ((index / rowLength) * 100).toFixed(0);
                        // console.log(percentLoaded);
                        $("#fundPercentageLoaded").css(
                            "width",
                            percentLoaded + "%"
                        );
                        $("#fundPercentageLoaded p").html(
                            "Funds Loaded: " + percentLoaded + "%"
                        );
                        var target = values[1]; // Fund name [0]
                        var splitter = target.split("\\");
                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }
                        // push values to array
                        splitter.push(values[4]); // Description 		subFund[1]
                        splitter.push(values[6]); // Designation GUID 	subFund[2]
                        splitter.push(values[9]); // College 			subFund[3]
                        splitter.push(values[8]); // Areas dropdowns 	subFund[4]
                        splitter.push(parseInt(values[7])); // Priority  subFund[5]
                        splitter.push(values[0]);
                        fundMaster.push(splitter);
                        if (fundCategory == "Colleges/Units") {
                            collegesUnitsList.push(collegeUnitFundName);
                            // append Colleges/Units to dropdown
                            // $('#collegesUnitsDropdown').append('<option value="' + designationID + '">' + collegeUnitFundName + '</option>');
                            // append Colleges/Units funds to dropdown
                            $("#collegesUnitsFundsDropdown").append(
                                '<option class="hide" data-college="' +
                                collegeUnitFundName +
                                '" value="' +
                                designationID +
                                '">' +
                                designationName +
                                "</option>"
                            );
                        } else if (
                            fundCategory == "Scholarships" ||
                            fundCategory == "The UC Fund" ||
                            fundCategory == "UC Health"
                        ) {
                            if (fundCategory != "The UC Fund") {
                                toggleHide = "hide";
                            }
                            $("#designationAreaDropdown").append(
                                '<option data-area="' +
                                fundCategory +
                                '" class="' +
                                toggleHide +
                                '" value="' +
                                designationID +
                                '">' +
                                designationName +
                                "</option>"
                            );
                        }
                        typeaheadArr.push(path);
                    });
                    $("#fundPercentageLoaded").fadeOut(2000);
                    $("#designationAreaDropdown option:first").text(
                        "-- Select The UC Fund to Support --"
                    );
                    var sortedFundMaster = fundMaster;
                    var sortedCollegesUnits = collegesUnitsList.sort();

                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }
                    var uniqueCollegesUnits = sortedCollegesUnits.filter(
                        onlyUnique
                    );

                    function multiDimensionalUnique(arr) {
                        var uniques = [];
                        var itemsFound = {};
                        for (var i = 0, l = arr.length; i < l; i++) {
                            var stringified = JSON.stringify(arr[i]);
                            if (itemsFound[stringified]) {
                                continue;
                            }
                            uniques.push(arr[i]);
                            itemsFound[stringified] = true;
                        }
                        return uniques;
                    }
                    var fundsUnique = multiDimensionalUnique(sortedFundMaster);
                    var trimmedCollegesUnits = [];
                    $.each(uniqueCollegesUnits, function(key, value) {
                        var trimmedCollege = $.trim(
                            value.substring(value.indexOf("-") + 1)
                        );
                        trimmedCollegesUnits.push(trimmedCollege);
                        $("#collegesUnitsDropdown").append(
                            $("<option></option>")
                            .val(value)
                            .text(trimmedCollege)
                        );
                    });

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text()
                            .toUpperCase() <
                            $(a)
                            .text()
                            .toUpperCase() ?
                            1 :
                            -1;
                    }
                    $("#collegesUnitsDropdown option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("select#collegesUnitsDropdown");
                    var typeaheadArrUnique = typeaheadArr
                        .filter(onlyUnique)
                        .sort();
                    // console.table(typeaheadArrUnique);
                    var substringMatcher = function(strs) {
                        return function findMatches(q, cb) {
                            var matches, substringRegex;
                            // an array that will be populated with substring matches
                            matches = [];
                            // regex used to determine if a string contains the substring `q`
                            substrRegex = new RegExp(q, "i");
                            // iterate through the pool of strings and for any string that
                            // contains the substring `q`, add it to the `matches` array
                            $.each(strs, function(i, str) {
                                if (substrRegex.test(str)) {
                                    matches.push(str);
                                }
                            });
                            cb(matches);
                        };
                    };
                    // $(".toggleOtherFund").click(function(e) {
                    // 	e.preventDefault();
                    // 	$("#advanced-search-fund").val("");
                    // 	$(this)
                    // 		.next()
                    // 		.slideDown();
                    // });
                    $("#scrollable-dropdown-menu .typeahead").typeahead({
                        hint: true,
                        highlight: true,
                        minLength: 1,
                    }, {
                        name: "typeaheadArr",
                        limit: 100,
                        source: substringMatcher(typeaheadArrUnique),
                    });
                    $(".typeahead").bind("typeahead:select", function(
                        ev,
                        suggestion
                    ) {
                        $("#hiddenFund").val(suggestion);
                        console.log(suggestion);
                        $.each(fundsUnique, function(x, subFund) {
                            // append GUID if terminal
                            if (subFund[6] === suggestion) {
                                $("#hiddenGuid").val(subFund[2]);
                            }
                        });
                    });
                }
            );
        },

        // setup designation search
        designationSearch: function() {
            // typeahead variables
            var typeahead = $("#txtDesignationPreDefined"); // $('#advanced-search-fund');
            var query = new BLACKBAUD.api.QueryService();
            var results = [];

            // get results
            query.getResults(BBI.Defaults.advancedDonationFormFundsQueryId, function(data) {
                // clean results
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];

                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });

                $.each(rows, function() {
                    var values = this.Values;
                    results.push({
                        value: values[6],
                        label: values[1],
                        parent: values[8],
                        collegeUnit: values[9]
                    });
                });

                // autopopulate designation from URL
                var guid = BBI.Methods.returnQueryValueByName("fund");
                var areaParameter = BBI.Methods.returnQueryValueByName("area");
                var unitParameter = BBI.Methods.returnQueryValueByName("unit");

                if (!!guid || !!areaParameter) {

                    console.log(areaParameter);
                    if (areaParameter == "ucfund") {
                        $('#areasToSuppportRadioGroup input[name=area][value="ucFund"]').prop('checked', true).trigger("change");
                    } else if (areaParameter == "scholarships") {
                        $('#areasToSuppportRadioGroup input[name=area][value="scholarships"]').prop('checked', true).trigger("change");
                    } else if (areaParameter == "college") {
                        $('#areasToSuppportRadioGroup input[name=area][value="collegeUnits"]').prop('checked', true).trigger("change");

                        if (!!unitParameter) {

                            $("select#collegeUnitsSelect")
                                .find('option[value^="' + unitParameter + '"]')
                                .prop("selected", true)
                                .trigger("change");

                            if (!!guid) {
                                console.log("Select fund!");
                                $("select#collegeUnitsFundSelect")
                                    .find('option[value^="' + guid + '"]')
                                    .prop("selected", true)
                                    .trigger("change");
                            }
                        }

                    } else if (areaParameter == "uchealth") {
                        $('#areasToSuppportRadioGroup input[name=area][value="ucHealth"]').prop('checked', true).trigger("change");
                    } else {
                        console.log("not found");
                    }

                    var result = results.filter(function(obj) {
                        return obj.value === guid;
                    })[0];
                    if (result != null) {
                        var label = result.label;
                        var parent = result.parent;
                        var colUnit = result.collegeUnit;
                        // $('#divDesignationCategory').hide();
                        // $('#divDesignationPreDefined').show();

                        console.table(result);
                        // console.log(parent.replace("/", ""));
                        var newParent = result.parent;
                        if (newParent == "UC Health") {
                            console.log("it's " + newParent);
                        } else if (newParent == "Scholarships") {
                            console.log("it's " + newParent);
                        } else if (newParent == "The UC Fund") {
                            console.log("it's " + newParent);
                        } else if (newParent == "Colleges/Units") {
                            console.log("it's " + newParent);
                        } else {
                            // do nothing
                            console.log("none of these!");
                        }

                        typeahead.val(label);
                        typeahead.attr('parent', parent);

                        $("#fundArea").val(parent);
                        $("#collegeUnit").val(colUnit);
                        $("#fundGuid").val(guid);
                        $("#fundName").val(label);



                        // $("#divDesignationPreDefined").slideDown();
                    }

                    typeahead.attr('desId', guid);


                    // switch (expression) {
                    // 	case x:
                    // 		// code block
                    // 		break;
                    // 	case y:
                    // 		// code block
                    // 		break;
                    // 	default:
                    // 	// code block
                    // }

                    // $("#areasToSuppportRadioGroup > .field-wrap > .toggle:not(:last-child)").hide();

                    // $("#areasToSuppportRadioGroup > .field-wrap > .toggle:last-child").slideDown();

                    // $("#advancedFundSearch").toggleClass("happy");

                    // document.getElementById("advancedFundSearch").checked = true;

                }
            });

            // $('.clear-pre-defined-designation').on('click', function (e)
            // {
            // 	e.preventDefault();
            // 	console.log("another fund search");

            // 	$("#divDesignationPreDefined").slideUp();
            // 	$("#emergency.toggle").slideDown();
            // })
        },

        populateAreasToSupportFields: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var ucFundDesignation = $("select#ucFundSelect");
            var ucHealthDesignation = $("select#ucHealthSelect");
            var scholarshipsDesignation = $("select#scholarshipsSelect");
            var collegeUnitDesignation = $("select#collegeUnitsSelect");
            var collegeUnitFundDesignation = $("select#collegeUnitsFundSelect");
            // if ($(mainDesignation).length !== 0) {
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.advancedDonationFormFundsQueryId,
                function(data) {
                    // fund data
                    var allFunds = data.Rows,
                        fundMaster = [],
                        topLevelAll = [],
                        typeaheadArr = [],
                        ucFundArr = [],
                        scholarshipsArr = [],
                        ucHealthArr = [];
                    // console.log(allFunds);
                    // remove all options in main drop-down except the first
                    $(
                            ucFundDesignation,
                            scholarshipsDesignation,
                            collegeUnitDesignation
                        )
                        .find("option")
                        .not("option:first")
                        .remove();
                    // get drop-down hierarchy and clean arrays
                    $.each(allFunds, function() {
                        // define values
                        var values = this.Values;
                        var target = values[1]; // Fund name [0]
                        var splitter = target.split("\\");
                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }
                        // push values to array
                        splitter.push(values[4]); // Description 		subFund[1]
                        splitter.push(values[6]); // Designation GUID 	subFund[2]
                        splitter.push(values[9]); // College 			subFund[3]
                        splitter.push(values[8]); // Areas dropdowns 	subFund[4]
                        splitter.push(parseInt(values[7])); // Priority  subFund[5]
                        fundMaster.push(splitter);
                        if (values[8] == "Colleges/Units") {
                            topLevelAll.push(values[9]);
                        } else if (values[8] == "The UC Fund") {
                            ucFundArr.push(splitter);
                        } else if (values[8] == "Scholarships") {
                            scholarshipsArr.push(splitter);
                        } else if (values[8] == "UC Health") {
                            ucHealthArr.push(splitter);
                        } else {}
                        var fundNameArr = values[1];
                        var fundGuidArr = values[6];
                        typeaheadArr.push(fundNameArr);
                    });
                    var sortedFundMaster = fundMaster;
                    // console.table(sortedFundMaster);
                    // console.log(scholarshipsArr.sort((a, b) => a[5].localeCompare(b[5])));
                    // console.log(ucHealthArr);
                    // console.log(typeaheadArr);
                    // const arrayColumn = (arr, n) => arr.map(x => x[n]);
                    // console.log(arrayColumn(typeaheadArr, 0));
                    function multiDimensionalUnique(arr) {
                        var uniques = [];
                        var itemsFound = {};
                        for (var i = 0, l = arr.length; i < l; i++) {
                            var stringified = JSON.stringify(arr[i]);
                            if (itemsFound[stringified]) {
                                continue;
                            }
                            uniques.push(arr[i]);
                            itemsFound[stringified] = true;
                        }
                        return uniques;
                    }
                    var fundsUnique = multiDimensionalUnique(sortedFundMaster);
                    // filter unique values
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }
                    var topLevelUnique = topLevelAll.filter(onlyUnique);
                    var collegeUnitsDropdown = topLevelUnique.sort();
                    $.each(collegeUnitsDropdown, function(key, value) {
                        //var trimmedCollege = $.trim(value.split("-")[1]);
                        var trimmedCollege = $.trim(
                            value.substring(value.indexOf("-") + 1)
                        );
                        // console.log(trimmedCollege);

                        $(collegeUnitDesignation).append(
                            $("<option></option>")
                            .val(value)
                            .text(trimmedCollege)
                        );
                    });

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text()
                            .toUpperCase() <
                            $(a)
                            .text()
                            .toUpperCase() ?
                            1 :
                            -1;
                    }
                    $("select#collegeUnitsSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("select#collegeUnitsSelect");
                    // .sort((a, b) => Number(a.price) - Number(b.price));
                    // ucFundArr = ucFundArr.sort();
                    // scholarshipsArr = scholarshipsArr.sort();
                    // ucHealthArr = ucHealthArr.sort();
                    fundsUnique.sort(function(a, b) {
                        return a[5] - b[5];
                    });
                    // console.table(fundsUnique);
                    $.each(fundsUnique, function(x, subFund) {
                        // append GUID if terminal
                        if (subFund[4] == "The UC Fund") {
                            $(ucFundDesignation).append(
                                $("<option></option>")
                                .val(subFund[2])
                                .text(subFund[0])
                            );
                        } else if (subFund[4] == "Scholarships") {
                            $(scholarshipsDesignation).append(
                                $("<option></option>")
                                .val(subFund[2])
                                .text(subFund[0])
                            );
                        } else if (subFund[4] == "UC Health") {
                            $(ucHealthDesignation).append(
                                $("<option></option>")
                                .val(subFund[2])
                                .text(subFund[0])
                            );
                        } else {
                            return;
                        }
                    });

                    $("#areasToSuppportRadioGroup select").prop(
                        "disabled",
                        false
                    );
                    var ucFundOptionValues = [];
                    $("#ucFundSelect option").each(function() {
                        if ($.inArray(this.value, ucFundOptionValues) > -1) {
                            $(this).remove();
                        } else {
                            ucFundOptionValues.push(this.value);
                        }
                    });
                    var scholarshipOptionValues = [];
                    $("#scholarshipsSelect option").each(function() {
                        if (
                            $.inArray(this.value, scholarshipOptionValues) > -1
                        ) {
                            $(this).remove();
                        } else {
                            scholarshipOptionValues.push(this.value);
                        }
                    });

                    var typeaheadArrUnique = typeaheadArr
                        .filter(onlyUnique)
                        .sort();
                    // console.table(typeaheadArrUnique.sort());
                    var substringMatcher = function(strs) {
                        return function findMatches(q, cb) {
                            var matches, substringRegex;
                            // an array that will be populated with substring matches
                            matches = [];
                            // regex used to determine if a string contains the substring `q`
                            substrRegex = new RegExp(q, "i");
                            // iterate through the pool of strings and for any string that
                            // contains the substring `q`, add it to the `matches` array
                            $.each(strs, function(i, str) {
                                if (substrRegex.test(str)) {
                                    matches.push(str);
                                }
                            });
                            cb(matches);
                        };
                    };
                    $(".toggleOtherFund").click(function(e) {
                        e.preventDefault();
                        toggleAreaValid(false);
                        $("#advanced-search-fund").val("");
                        $(this)
                            .next()
                            .slideDown();
                    });
                    $("#scrollable-dropdown-menu .typeahead").typeahead({
                        hint: true,
                        highlight: true,
                        minLength: 1,
                    }, {
                        name: "typeaheadArr",
                        limit: 100,
                        source: substringMatcher(typeaheadArrUnique),
                    });
                    $(".typeahead").bind("typeahead:select", function(
                        ev,
                        suggestion
                    ) {
                        $("#fundName").val(suggestion);
                        //console.log(suggestion);
                        $.each(fundsUnique, function(x, subFund) {
                            // append GUID if terminal
                            if (subFund[0] === suggestion) {
                                $("#fundGuid").val(subFund[2]);
                                toggleAreaValid(true);
                            }
                        });
                    });

                    function toggleAreaValid(value) {
                        if ((value = true)) {
                            $(".validation-icon.fund i")
                                .removeClass("fa-times-circle")
                                .addClass("fa-check-circle");
                        } else {
                            $(".validation-icon.fund i")
                                .removeClass("fa-check-circle")
                                .addClass("fa-times-circle");
                        }
                    }
                    // College/Units drop-down
                    $(collegeUnitDesignation).on("change", function() {
                        // define designation selection
                        var selection = $(this).val();
                        console.log(selection);
                        // remove all options in sub drop-down except the first
                        $(collegeUnitFundDesignation)
                            .find("option")
                            .not("option:first")
                            .remove();
                        // loop through funds
                        $.each(fundsUnique, function(x, subFund) {
                            // append GUID if terminal
                            if (
                                subFund[3] === selection &&
                                subFund[4] == "Colleges/Units"
                            ) {
                                $(collegeUnitFundDesignation).append(
                                    $("<option></option>")
                                    .val(subFund[2])
                                    .text(subFund[0])
                                );
                            }
                        });
                    });

                    BBI.Methods.designationSearch();
                }
            );

            // Check if 'type' query parameter is set to monthly (not case-sensitive)
            /*
            var getUrlParameter = function getUrlParameter(sParam)
            {
            	var sPageURL = window.location.search.substring(1),
            		sURLVariables = sPageURL.split("&"),
            		sParameterName,
            		i;
            	for (i = 0; i < sURLVariables.length; i++) {
            		sParameterName = sURLVariables[i].split("=");
            		if (sParameterName[0] === sParam) {
            			return sParameterName[1] === undefined ?
            				true :
            				decodeURIComponent(
            					sParameterName[1].toLowerCase()
            				);
            		}
            	}
            };
            var urlFund = getUrlParameter("fund");
            var urlUnit = getUrlParameter("unit");

            function urlParameterCheck()
            {
            	setTimeout(function ()
            	{
            		$("select#collegeUnitsSelect")
            			.find('option[value^="' + urlUnit + '"]')
            			.prop("selected", true)
            			.trigger("change");
            		if (urlFund) {
            			console.log("true: " + urlFund);
            			// $("select#collegeUnitsFundSelect")
            			$("select")
            				.delay(500)
            				.find('option[value="' + urlFund + '"]')
            				.prop("selected", true)
            				.trigger("change");
            		} else {
            			console.log("false: " + urlFund);
            		}
            		console.log(urlUnit);
            	}, 750);
            }
            urlParameterCheck(); */

            /* 
            function myFunction() {
            	document.getElementById("advancedFundSearch").checked = true;
            	setTimeout(function ()
            	{
            		$("#areasToSuppportRadioGroup > .field-wrap > .toggle:not(:last-child)").hide();

            		$("#areasToSuppportRadioGroup > .field-wrap > .toggle#advancedFundSearch").show();

            		$("select#collegeUnitsSelect")
            			.find('option[value^="' + urlUnit + '"]')
            			.prop("selected", true)
            			.trigger("change");
            		if (urlFund) {
            			console.log("true: " + urlFund);
            			// $("select#collegeUnitsFundSelect")
            			$("select")
            				.delay(500)
            				.find('option[value="' + urlFund + '"]')
            				.prop("selected", true)
            				.trigger("change");
            		}
            		console.log(urlUnit);

            		var guid = BBI.Methods.returnQueryValueByName('fund');
            		console.log(guid);

            	}, 750);
            }

            myFunction();
            console.log("done done done");
            }
             */
        },
        populateTypeaheadField: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var ucFundDesignation = $("select#ucFundSelect");
            var ucHealthDesignation = $("select#ucHealthSelect");
            var scholarshipsDesignation = $("select#scholarshipsSelect");
            var collegeUnitDesignation = $("select#collegeUnitsSelect");
            var collegeUnitFundDesignation = $("select#collegeUnitsFundSelect");
            // if ($(mainDesignation).length !== 0) {
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.advancedDonationFormFundsQueryId,
                function(data) {
                    // fund data
                    var allFunds = data.Rows;
                    var fundMaster = [];
                    var topLevelAll = [];
                    var typeaheadArr = [];
                    // console.log(allFunds);
                    // remove all options in main drop-down except the first
                    $(
                            ucFundDesignation,
                            scholarshipsDesignation,
                            collegeUnitDesignation
                        )
                        .find("option")
                        .not("option:first")
                        .remove();
                    // get drop-down hierarchy and clean arrays
                    $.each(allFunds, function() {
                        // define values
                        var values = this.Values;
                        var target = values[0]; // Fund name [0]
                        var splitter = target.split("\\");
                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }
                        // push values to array
                        splitter.push(values[4]); // Description [1]
                        splitter.push(values[6]); // Designation GUID [2]
                        splitter.push(values[9]); // College [3]
                        splitter.push(values[8]); // The UC Fund/Scholarships/Colleges/Unit [4]
                        fundMaster.push(splitter);
                        if (values[8] == "Colleges/Units") {
                            topLevelAll.push(values[9]);
                        }
                        var fundNameArr = values[0];
                        var fundGuidArr = values[6];
                        typeaheadArr.push(fundNameArr);
                    });
                    var sortedFundMaster = fundMaster.sort();
                    // console.log(typeaheadArr);
                    // const arrayColumn = (arr, n) => arr.map(x => x[n]);
                    // console.log(arrayColumn(typeaheadArr, 0));
                    function multiDimensionalUnique(arr) {
                        var uniques = [];
                        var itemsFound = {};
                        for (var i = 0, l = arr.length; i < l; i++) {
                            var stringified = JSON.stringify(arr[i]);
                            if (itemsFound[stringified]) {
                                continue;
                            }
                            uniques.push(arr[i]);
                            itemsFound[stringified] = true;
                        }
                        return uniques;
                    }
                    var fundsUnique = multiDimensionalUnique(sortedFundMaster);
                    // console.log(fundsUnique);
                    // filter unique values
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }
                    var topLevelUnique = topLevelAll.filter(onlyUnique);
                    var collegeUnitsDropdown = topLevelUnique.sort();
                    $.each(collegeUnitsDropdown, function(key, value) {
                        var trimmedCollege = $.trim(
                            value.substring(value.indexOf("-") + 1)
                        );
                        $(collegeUnitDesignation).append(
                            $("<option></option>")
                            .val(value)
                            .text(trimmedCollege)
                        );
                    });
                    var substringMatcher = function(strs) {
                        return function findMatches(q, cb) {
                            var matches, substringRegex;
                            // an array that will be populated with substring matches
                            matches = [];
                            // regex used to determine if a string contains the substring `q`
                            substrRegex = new RegExp(q, "i");
                            // iterate through the pool of strings and for any string that
                            // contains the substring `q`, add it to the `matches` array
                            $.each(strs, function(i, str) {
                                if (substrRegex.test(str)) {
                                    matches.push(str);
                                }
                            });
                            cb(matches);
                        };
                    };
                    // $(".toggleOtherFund").click(function(e) {
                    // 	e.preventDefault();
                    // 	toggleAreaValid(false);
                    // 	$("#advanced-search-fund").val("");
                    // 	$(this)
                    // 		.next()
                    // 		.slideDown();
                    // });
                    $("#scrollable-dropdown-menu .typeahead").typeahead({
                        hint: false,
                        highlight: true,
                        minLength: 1,
                    }, {
                        name: "typeaheadArr",
                        limit: 100,
                        source: substringMatcher(typeaheadArr),
                    });
                    $(".typeahead").bind("typeahead:select", function(
                        ev,
                        suggestion
                    ) {
                        $("#fundName").val(suggestion);
                        //console.log(suggestion);
                        $.each(fundsUnique, function(x, subFund) {
                            // append GUID if terminal
                            if (subFund[0] === suggestion) {
                                console.log(subFund[2]);
                                $("#fundGuid").val(
                                    "https://foundation.uc.edu/donate?id=" +
                                    subFund[2]
                                );
                                // toggleAreaValid(true);
                            }
                        });
                    });
                    $("#copyButton").click(function(e) {
                        e.preventDefault();
                        var copyText = document.getElementById("fundGuid");
                        copyText.select();
                        copyText.setSelectionRange(0, 99999);
                        document.execCommand("copy");
                        console.log(
                            "https://foundation.uc.edu/donate?id=" +
                            copyText.value
                        );
                    });
                }
            );
            // }
        },
        populateCountryDropdowns: function() {
            var countryService = new BLACKBAUD.api.CountryService({
                url: BBI.Defaults.rootpath,
                crossDomain: false,
            });
            countryService.getCountries(function(country) {
                $.each(country, function() {
                    $("#personalCountry").append(
                        $("<option></option>")
                        .val(this["Description"])
                        .text(this["Description"])
                        .attr("id", this["Id"])
                    );
                });
                BBI.Methods.populateStateDropdowns(
                    $("#personalCountry")
                    .find('[value="United States"]')
                    .attr("id")
                );
                $.each(country, function() {
                    $("#ackCountry").append(
                        $("<option></option>")
                        .val(this["Description"])
                        .text(this["Description"])
                        .attr("id", this["Id"])
                    );
                });
                BBI.Methods.populateAckStateDropdowns(
                    $("#ackCountry")
                    .find('[value="United States"]')
                    .attr("id")
                );
                $("#ackCountry")
                    .val("United States")
                    .on("change", function() {
                        var countryID = $(this)
                            .find(":selected")
                            .attr("id");
                        BBI.Methods.populateAckStateDropdowns(countryID);
                    });
                $("#personalCountry")
                    .val("United States")
                    .on("change", function() {
                        var countryID = $(this)
                            .find(":selected")
                            .attr("id");
                        BBI.Methods.populateStateDropdowns(countryID);
                });
            });
        },
        populateStateDropdowns: function(countryID) {
            var countryService = new BLACKBAUD.api.CountryService({
                url: BBI.Defaults.rootpath,
                crossDomain: false,
            });
            countryService.getStates(countryID, function(state) {
                $("#personalState option:gt(0)").remove();
                $.each(state, function() {
                    $("#personalState").append(
                        $("<option></option>")
                        .val(this["Abbreviation"])
                        .text(this["Description"])
                    );
                });
                // var lengthOfListOptions = $("#personalState option").length;
                var lengthOfListOptions = document.getElementById("personalState").length;
                if (lengthOfListOptions == 1) {
                    $(".personalState-container").addClass("hide");
                } else {
                    $(".personalState-container").removeClass("hide");
                }
            });
        },
        populateAckStateDropdowns: function(countryID) {
            var countryService = new BLACKBAUD.api.CountryService({
                url: BBI.Defaults.rootpath,
                crossDomain: false,
            });
            countryService.getStates(countryID, function(state) {
                $("#ackState option:gt(0)").remove();
                $.each(state, function() {
                    $("#ackState").append(
                        $("<option></option>")
                        .val(this["Abbreviation"])
                        .text(this["Description"])
                    );
                });
            });
        },
        // get title table
        populateTitle: function() {
            var selectAckTitle = $("#ackTitle");
            $.get(
                BLACKBAUD.api.pageInformation.rootPath +
                "webapi/CodeTable/" +
                BBI.Defaults.titleTable,
                function(data) {
                    for (var i = 0, j = data.length; i < j; i++) {
                        selectAckTitle.append(
                            '<option value="' +
                            data[i].Id +
                            '">' +
                            data[i].Description +
                            "</option>"
                        );
                    }
                }
            ).done(function() {
                selectAckTitle.val("-1").change();
            });
        },
        populateDesignationIds: function() {
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.highlightedFundsQueryId,
                function(data) {
                    var fields = data.Fields,
                        rows = data.Rows,
                        fieldArray = [];
                    $.each(fields, function(key, value) {
                        fieldArray[value.Name] = key;
                    });
                    $.each(rows, function() {
                        var values = this["Values"],
                            designationID =
                            values[fieldArray["System record ID"]],
                            designationName = values[fieldArray["Public name"]], // use friendly name
                            itemHTML =
                            '<li class="designationButton"><a rel="' +
                            designationID +
                            '">' +
                            designationName +
                            "</a></li>";
                        $(".designationButtonWrapper").append(itemHTML);
                    });
                    $(".designationButton a").on("click", function() {
                        $(".designationButton .selected").removeClass(
                            "selected"
                        );
                        $(this).addClass("selected");
                        $("#designationId").val($(this).attr("rel"));
                        $("#fundDesignation1").val("0");
                        $("#fundDesignation2")
                            .val("0")
                            .hide();
                    });
                }
            );
        },
        populateCustomDesignationIds: function() {
            var queryService = new BLACKBAUD.api.QueryService();
            queryService.getResults(
                BBI.Defaults.highlightedUcgniFundsQueryId,
                function(data) {
                    var fields = data.Fields,
                        rows = data.Rows,
                        fieldArray = [];
                    console.log(fields);
                    console.log(rows);
                    $.each(fields, function(key, value) {
                        fieldArray[value.Name] = key;
                    });
                    $.each(rows, function() {
                        var values = this["Values"],
                            designationID =
                            values[fieldArray["System record ID"]],
                            designationName = values[fieldArray["Public name"]], // use friendly name
                            itemHTML =
                            '<li class="designationButton"><a rel="' +
                            designationID +
                            '">' +
                            designationName +
                            "</a></li>";
                        //$('.ucgniDesignationButtonWrapper').append(itemHTML);
                        //console.log(values);
                    });
                    // $('.designationButton a').on('click', function() {
                    //     $('.designationButton .selected').removeClass('selected');
                    //     $(this).addClass('selected');
                    //     $('#designationId').val($(this).attr('rel'));
                    //     $('#fundDesignation1').val('0');
                    //     $('#fundDesignation2').val('0').hide();
                    // });
                }
            );
        },
        populateCustomCascadingFields: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var mainDesignation = $("#fundDesignation1");
            var subDesignation = $("#fundDesignation2");
            var fundsDesignation = $("#funds");
            var fundsResult = $("#fundsResult");
            if ($(mainDesignation).length !== 0) {
                var queryService = new BLACKBAUD.api.QueryService();
                queryService.getResults(
                    BBI.Defaults.cascadingFundsQueryId,
                    function(data) {
                        // fund data
                        var allFunds = data.Rows;
                        var fundMaster = [];
                        var topLevelAll = [];
                        // remove all options in main drop-down except the first
                        $(mainDesignation)
                            .find("option")
                            .not("option:first")
                            .remove();
                        // get drop-down hierarchy and clean arrays
                        $.each(allFunds, function() {
                            // define values
                            var values = this.Values;
                            var target = values[3];
                            var splitter = target.split("\\");
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
                            // var newValue = value.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase();
                            $(fundsDesignation).append(
                                $(
                                    "<span class='btn btn-primary' data-group='" +
                                    value +
                                    "' >" +
                                    value +
                                    "</span>"
                                )
                            );
                            $(mainDesignation).append(
                                $("<option></option>")
                                .val(value)
                                .text(value)
                            );
                        });
                        if ($(fundsDesignation).length == 0) {
                            //it doesn't exist
                        } else {
                            $.each(fundMaster, function(x, subFund) {
                                $(fundsResult).append(
                                    $(
                                        "<div data-group='" +
                                        subFund[0] +
                                        "' style='display:none;'>" +
                                        subFund[2] +
                                        "</div>"
                                    )
                                );
                            });
                        }
                        $("#funds span").on("click", function() {
                            if ($(this).hasClass("active")) {} else {
                                $("#funds span.active").removeClass("active");
                                $(this).addClass("active");
                            }
                            var dataGroup = $(this).data("group");
                            console.log(dataGroup);
                            $(fundsResult)
                                .find("div")
                                .hide(500);
                            $(
                                '#fundsResult div[data-group="' +
                                dataGroup +
                                '"]'
                            ).each(function(i) {
                                //var dataVal = $(this).data('group');
                                $(this).show(500);
                            });
                            // $.each(fundMaster, function(x, subFund) {
                            //     // append GUID if terminal
                            //     var dataVal = $(this).data('group');
                            //     if (subFund[0] === dataVal) {
                            //         $(this).show(500);
                            //     }
                            // });
                        });
                        // category drop-down
                        $(mainDesignation).on("change", function() {
                            // remove selected class from designation buttons
                            $(".designationButton .selected").removeClass(
                                "selected"
                            );
                            // define designation selection
                            var selection = $(this).val();
                            // remove all options in sub drop-down except the first
                            $(subDesignation)
                                .find("option")
                                .not("option:first")
                                .remove();
                            // loop through funds
                            $.each(fundMaster, function(x, subFund) {
                                // append GUID if terminal
                                if (subFund[0] === selection) {
                                    $(subDesignation).append(
                                        $("<option></option>")
                                        .val(subFund[1])
                                        .text(subFund[2])
                                    );
                                }
                            });
                            // toggle designation drop-down
                            if ($(this).val() === "0") {
                                $(subDesignation).hide();
                            } else {
                                $(subDesignation).show();
                            }
                        });
                    }
                );
            }
        },
        populateCascadingFields: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var mainDesignation = $("#fundDesignation1");
            var subDesignation = $("#fundDesignation2");
            if ($(mainDesignation).length !== 0) {
                var queryService = new BLACKBAUD.api.QueryService();
                queryService.getResults(
                    BBI.Defaults.cascadingFundsQueryId,
                    function(data) {
                        // fund data
                        var allFunds = data.Rows;
                        var fundMaster = [];
                        var topLevelAll = [];
                        // remove all options in main drop-down except the first
                        $(mainDesignation)
                            .find("option")
                            .not("option:first")
                            .remove();
                        // get drop-down hierarchy and clean arrays
                        $.each(allFunds, function() {
                            // define values
                            var values = this.Values;
                            var target = values[3];
                            var splitter = target.split("\\");
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
                            $(mainDesignation).append(
                                $("<option></option>")
                                .val(value)
                                .text(value)
                            );
                        });
                        // category drop-down
                        $(mainDesignation).on("change", function() {
                            // remove selected class from designation buttons
                            $(".designationButton .selected").removeClass(
                                "selected"
                            );
                            // define designation selection
                            var selection = $(this).val();
                            // remove all options in sub drop-down except the first
                            $(subDesignation)
                                .find("option")
                                .not("option:first")
                                .remove();
                            // loop through funds
                            $.each(fundMaster, function(x, subFund) {
                                // append GUID if terminal
                                if (subFund[0] === selection) {
                                    $(subDesignation).append(
                                        $("<option></option>")
                                        .val(subFund[1])
                                        .text(subFund[2])
                                    );
                                }
                            });
                            // toggle designation drop-down
                            if ($(this).val() === "0") {
                                $(subDesignation).hide();
                            } else {
                                $(subDesignation).show();
                            }
                        });
                    }
                );
            }
        },
        initAdfTabs: function() {
            //default state
            $("#adfTributToggle").show();
            $("#adfFrequency").hide();
            $("#adfTabsMenu a").on("click", function() {
                var tabReference = $(this).attr("id");
                $("#adfTabsMenu .selected").removeClass("selected");
                $(this)
                    .parent("li")
                    .addClass("selected");
                //handle states of form
                if (tabReference === "tabRecurring") {
                    $("#adfTributToggle").hide();
                    $("#adfFrequency").show();
                } else if (tabReference === "tabPledge") {
                    $("#adfFrequency").hide();
                } else if (tabReference === "tabFaculty") {
                    $("#adfFrequency").hide();
                } else {
                    //tabOneTime
                    //default state
                    $("#adfTributToggle").show();
                    $("#adfFrequency").hide();
                }
            });
        },

        // validation markers
        validationMarkers: function() {
            $('<span class="marker"></span>').insertBefore('input.required');
        },

        validateADF: function() {
            $(".invalidLabel.adfNote").remove();
            $(".invalid").removeClass("invalid");

            var ValidationMessage = [];
            var isValid = true;
            $("input.required:visible, select.required:visible").each(function() {
                if ($.trim($(this).val()) === "" || $(this).val() == "-1") {
                    var requiredFieldMessage =
                        '<span class="invalidLabel adfNote"><i class="fa fa-exclamation-circle"></i>This is a required field.</span>';
                    isValid = false;
                    $(this).addClass("invalid");
                    $(this).after(requiredFieldMessage);
                }
            });
            if ($("#giftListEmpty").is(":visible")) {
                // console.log(isValid + ":(");
                isValid = false;
                $(".BBFormValidatorSummary").html(
                    '<p class="giftAmountError">Please add an item to your cart.</p>'
                );
            }
            $(".invalid")
                .first()
                .focus();
            $(".invalid").on("keydown", function() {
                $(this).unbind("keydown");
                $(this).removeClass("invalid");
                $(this)
                    .parent()
                    .find(".invalidLabel")
                    .remove();
            });
            return isValid;
        },

        // get donation data
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
                    Designations: [],
                    IsAnonymous: false,
                    Attributes: [],
                    MerchantAccountId: BBI.Defaults.MerchantAccountId
                },
                Origin: {
                    PageId: BBI.Defaults.pageId,
                    PageName: 'Giving Form V2'
                },
            };

            let billingtitle = $('#personalTitle option:selected').text().trim(),
                firstName = $('#personalFirstName').val(),
                lastName = $('#personalLastName').val(),
                address = $('#personalAddress').val(),
                addresstype = $('#personalAddressType option:selected').val(),
                country = $('#personalCountry option:selected').text().trim(),
                city = $('#personalCity').val(),
                state = $('#personalState option:selected').val(),
                zipcode = $('#personalZip').val(),
                phone = $('#personalPhone').val(),
                emailaddress = $('#personalEmail').val(),
                emailaddresstype = $('#personalEmailType option:selected').val(),
                pledgeIdValue = $("#pledgeId").val(),
                pledgeAmountValue = $("#pledgeAmount").val();

            localStorage.setItem("billingtitle", billingtitle);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("lastName", lastName);
            localStorage.setItem("address", address);
            localStorage.setItem("addresstype", addresstype);
            localStorage.setItem("address", address);
            localStorage.setItem("country", country);
            localStorage.setItem("city", city);
            localStorage.setItem("state", state);
            localStorage.setItem("zipcode", zipcode);
            localStorage.setItem("phone", phone);
            localStorage.setItem("emailaddresstype", emailaddresstype);
            localStorage.setItem("emailaddress", emailaddress);

            if ($('#giftTypeSelect').val() != "Pledge") {
                // assign designations (split gifts)
                $('.fund-card').not('.empty, .proc-fee:hidden').each(function() {
                    var gift = {
                        Amount: $(this).find('input').val(),
                        DesignationId: $(this).find('.fund-guid').text()
                    };

                    /*
                    var guidValue = $(this).find('.fund-guid').text();
                    if (guidValue == BBI.Defaults.generalFreeFormFund) {
                    	// if (
                    	//     $("#otherArea:visible").length !== 0 &&
                    	//     $("#otherArea:visible").val().length > 0
                    	// ) {
                    	var otherArea = {
                    		Value: $(this).find('.fund-name').text(),
                    	};
                    	donation.Gift.Comments = otherArea;
                    	// }

                    	// var str = "";

                    	// var instructions = $(this).find('.fund-name').text();
                    	// var amount = $(this).find('input').val();

                    	// str = "Other Fund: Amount: $" + amount + " | Fund Name: " + instructions;
                    	// // str = instructions;

                    	// donation.Gift.Comments = donation.Gift.Comments + str + " // ";
                    }
                    */

                    donation.Gift.Designations.push(gift);
                });
            }

            // assign donor title and custom attributes
            try {
                // donor title
                if ($('#personalTitle').val() !== '-1') {
                    donation.Donor.Title = $('#personalTitle option:selected').text();
                }

                // if solicitor code is in URL
                // if (!!BBI.Methods.returnQueryValueByName('solicitor')) {
                // var solicitorAttribute = {
                //     AttributeId: BBI.Defaults.solicitorCode,
                //     Value: BBI.Methods.returnQueryValueByName('solicitor')
                // };
                // donation.Gift.Attributes.push(solicitorAttribute);
                // }

                // matching gift
                if ($('#matchingGift').is(':checked')) {
                    var matchingGift = {
                        AttributeId: BBI.Defaults.matchingGift,
                        Value: 'True'
                    };
                    donation.Gift.Attributes.push(matchingGift);

                    // matching gift company name
                    if ($('#matchingGiftSearch').val() !== '') {
                        var matchingGiftCompanyName = {
                            AttributeId: BBI.Defaults.matchingGiftCompanyName,
                            Value: $('#matchingGiftName').val()
                        };
                        donation.Gift.Attributes.push(matchingGiftCompanyName);
                    }
                }

                // conditional for corporate
                if ($('#corporateGift').is(':checked')) {
                    donation.Gift.IsCorporate = true;
                    donation.Donor.OrganizationName = $('#companyName').val();
                }

            } catch (err) {
                console.log(err);
            }
            // comments
            if ($('#comments').val() !== '') {
                // var comments = {
                //     // AttributeId: BBI.Defaults.comments,
                //     Value: $('#comments').val()
                // };
                // donation.Gift.Comments.push(comments);
                donation.Gift.Comments = $.trim($("#comments").val());
            }

            // conditional for anonymous
            // if ($('#anonymousGift').is(':checked')) {
            //     donation.Gift.IsAnonymous = true;
            // }
            if ($("#anonymous:checked").length !== 0) {
                donation.Gift.IsAnonymous = true;
            }

            /*
            if ($("#wantOrnament:checked").length !== 0) {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Want Ornament?"
                    ],
                    Value: "Yes",
                };
                customAttributes.push(wantOrnament);
            } else {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Want Ornament?"
                    ],
                    Value: "No",
                };
                customAttributes.push(wantOrnament);
            } */

            // conditional for tribute
            // tribute (honoree) attributes
            if ($("input#honorOf:checked").length !== 0) {
                if ($("#tributeType:visible").length !== 0) {
                    var tributeType = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Tribute Gift Type"
                        ],
                        Value: $("#tributeType option:selected").val(),
                    };
                    customAttributes.push(tributeType);
                }
                if (
                    $("#tributeFirstName").length !== 0 &&
                    $("#tributeLastName").length !== 0
                ) {
                    var honoreeName = {
                        AttributeId: BBI.Defaults.customADFAttributes["Honoree Name"],
                        Value: $("#tributeFirstName").val() +
                            " " +
                            $("#tributeLastName").val(),
                    };
                    customAttributes.push(honoreeName);
                }
            }
            // acknowledgee attributes
            if ($("input#mailLetter:checked").length !== 0) {
                // if (
                //     $("#ackTitle").length !== 0 &&
                //     $("#ackTitle").val() !== "-1"
                // ) {
                //     var ackTitle = {
                //         AttributeId: BBI.Defaults.customADFAttributes[
                //             "Acknowledgee Title"
                //         ],
                //         Value: $("#ackTitle option:selected").text(),
                //     };
                //     customAttributes.push(ackTitle);
                // }
                if ($("#ackFirstName").length !== 0) {
                    var ackFirstName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee First Name"
                        ],
                        Value: $("#ackFirstName").val(),
                    };
                    customAttributes.push(ackFirstName);
                }
                if ($("#ackLastName").length !== 0) {
                    var ackLastName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Last Name"
                        ],
                        Value: $("#ackLastName").val(),
                    };
                    customAttributes.push(ackLastName);
                }
                if ($("#ackAddress").length !== 0) {
                    var ackAddress = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Address"
                        ],
                        Value: $("#ackAddress").val(),
                    };
                    customAttributes.push(ackAddress);
                }
                if ($("#ackCity").length !== 0) {
                    var ackCity = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee City"
                        ],
                        Value: $("#ackCity").val(),
                    };
                    customAttributes.push(ackCity);
                }
                if ($("#ackState").length !== 0) {
                    var ackState = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee State"
                        ],
                        Value: $("#ackState option:selected").val(),
                    };
                    customAttributes.push(ackState);
                }
                if ($("#ackZipCode").length !== 0) {
                    var ackZip = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Zip"
                        ],
                        Value: $("#ackZipCode").val(),
                    };
                    customAttributes.push(ackZip);
                }
                if ($("#ackCountry").length !== 0) {
                    var ackCountry = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Country"
                        ],
                        Value: $("#ackCountry option:selected").text(),
                    };
                    customAttributes.push(ackCountry);
                }
                if (
                    $("#ackPhoneNumber").length !== 0 &&
                    $("#ackPhoneNumber").val() !== ""
                ) {
                    var ackPhone = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Phone"
                        ],
                        Value: $("#ackPhoneNumber").val(),
                    };
                    customAttributes.push(ackPhone);
                }
                if (
                    $("#ackEmail").length !== 0 &&
                    $("#ackEmail").val() !== ""
                ) {
                    var ackEmail = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Email"
                        ],
                        Value: $("#ackEmail").val(),
                    };
                    customAttributes.push(ackEmail);
                }
            }
            donation.Gift.Attributes = customAttributes;

            // if ($('#honorOf').is(':checked') && !$('#mailLetter').is(':checked')) {
            //     donation.Gift.Tribute = {
            //         TributeDefinition: {
            //             Type: $("#tributeType").children("option:selected").val(),
            //             // $('#tributeType option:selected').val(),
            //             Description: 'New Tribute',
            //             FirstName: $('#tributeFirstName').val(),
            //             LastName: $('#tributeLastName').val()
            //         }
            //     };
            // }

            // conditional for tribute acknowledgement
            // if ($('#honorOf').is(':checked') && $('#mailLetter').is(':checked')) {
            //     donation.Gift.Tribute = {
            //         TributeDefinition: {
            //             Type: $("#tributeType option:selected").val(),
            //             // $('#tributeType input:checked').val(),
            //             Description: 'New Tribute',
            //             FirstName: $('#tributeFirstName').val(),
            //             LastName: $('#tributeLastName').val()
            //         },
            //         Acknowledgee: {
            //             FirstName: $('#ackFirstName').val(),
            //             LastName: $('#ackLastName').val(),
            //             AddressLines: $('#ackAddress').val(),
            //             City: $('#ackCity').val(),
            //             State: $('#ackState option:selected').val(),
            //             PostalCode: $('#ackZipCode').val(),
            //             Country: $.trim($('#ackCountry option:selected').text()),
            //             Phone: $('#ackPhoneNumber').val(),
            //             Email: $('#ackEmail').val()
            //         }
            //     };
            // }

            // conditional for recurring
            if ($('#giftTypeSelect').val() == "Monthly") {
                console.log("Monthly check");
                var startDate = $("#startDate").datepicker("getDate"), //Date.parse();
                    DayOfWeek = startDate.getDay(),
                    DayOfMonth = startDate.getDate(),
                    StartMonth = startDate.getMonth(),
                    frequency = $("#frequency").val();
                // var endDate = $("#endDate").val().length !== 0 ? $("#endDate").val() : null;
                if (frequency == 1) {
                    donation.Gift["Recurrence"] = {
                        DayOfWeek: DayOfWeek,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else if (frequency == 2) {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                }
            }

            // conditional for pledge installments
            if ($('#giftTypeSelect').val() == "Pledge") {
                console.log("Pledge check");

                var pledge = {
                    AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                    Value: pledgeIdValue,
                };
                customAttributes.push(pledge);

                // donation.Gift.Attributes = [{
                //     AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                //     Value: pledgeAmountValue
                // }];

                donation.Gift.Designations = [{
                    Amount: pledgeAmountValue,
                    DesignationId: BBI.Defaults.pledgeFund,
                }];

                donation.Gift.Attributes = customAttributes;

            }

            // conditional for bill me later
            // if ($('#billMeLater').is(':checked')) {
            //     donation.Gift.PaymentMethod = 1;
            // }

            // set bbsp return url (credit card)
            if (donation.Gift.PaymentMethod === 0) {
                // donation.BBSPReturnUri = window.location.href;
            }

            // if finder number is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('efndnum')) {
                donation.Gift.FinderNumber = BBI.Methods.returnQueryValueByName('efndnum');
            }

            // if source code is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('source')) {
                donation.Gift.SourceCode = BBI.Methods.returnQueryValueByName('source');
            }

            // if appeal id exists
            if (!!BBI.Methods.returnQueryValueByName('appeal')) {
                donation.Origin.AppealId = BBI.Methods.returnQueryValueByName('appeal');
            }

            if ( window.location.pathname.toLowerCase().startsWith("/fye") ) {
                var origin = {
                    // AppealId: "07690458-068e-409d-90ea-ff2e605b6a11",
                    AppealId: "96eacba5-3a64-4c20-9461-63a743044717",
                    PageId: BLACKBAUD.api.pageInformation.pageId
                };
                donation.Origin = origin;
            }

            if ( window.location.pathname.toLowerCase().startsWith("/college-of-medicine") ) {
                var origin = {
                    AppealId: "47E0774C-8A1A-4A18-92AA-6EFBDBE7800F",
                    PageId: BLACKBAUD.api.pageInformation.pageId
                };
                donation.Origin = origin;
            }

            // if ($('#appeal').length !== 0 && !$('#appeal').is(':empty')) {
            //     donation.Gift.AppealId = $('#appeal').text();
            // }

            if ($("#wantOrnament:checked").length !== 0) {
                // Want Ornament?
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "Yes"
                };
                donation.Gift.Attributes.push(wantOrnament);
            } else {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "No"
                };
                donation.Gift.Attributes.push(wantOrnament);
            }

            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                console.log(donation);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                // $("#adfSubmitButton")
                $("#adfSubmit")
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

            console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );

            // return donation object
            // return donation;
        },

        // check equality of server date and (recurring or pledge installment gift) start date
        isProcessNow: function() {
            var frequency,
                startDate;

            if ($('#recurringGift').is(':checked')) {
                frequency = $("#frequency").val();
                startDate = new Date($('#startDate').attr('data-date'));
            } else if ($('#pledgeGift').is(':checked')) {
                frequency = $("#pledgeFrequency").val();
                startDate = new Date($('#pledgeStartDate').attr('data-date'));
            }

            var dayOfMonth = startDate.getDate(),
                month = startDate.getMonth() + 1,
                serverDate = BBI.Defaults.serverDate,
                recurrenceStartDate = startDate,
                startDateIsTodayDate = false,
                isProcessedNow = false;

            if (recurrenceStartDate.getFullYear() === serverDate.getFullYear() && recurrenceStartDate.getMonth() === serverDate.getMonth() && recurrenceStartDate.getDate() === serverDate.getDate()) {
                startDateIsTodayDate = true;
            } else {
                return false;
            }

            if (frequency === '2' || frequency === '3') {
                isProcessedNow = startDateIsTodayDate && dayOfMonth === serverDate.getDate();
            } else if (frequency === '4') {
                isProcessedNow = startDateIsTodayDate && dayOfMonth === serverDate.getDate() && month === serverDate.getMonth() + 1;
            } else {
                isProcessedNow = false;
            }

            return isProcessedNow;
        },

        submitQueryADF: function() {
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $(".miniInputText").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [],
                    IsAnonymous: false,
                    MerchantAccountId: BBI.Defaults.MerchantAccountId,
                },
            };
            if ($("#anonymous:checked").length !== 0) {
                donation.Gift.IsAnonymous = true;
            }
            //other area free text entry
            // if ($("#giftListNotEmpty .otherDesignation").length !== 0) {
            // 	donation.Gift.Comments =
            // 		"Area of support: " +
            // 		$("#giftListNotEmpty .otherDesignation .fund-name").text();
            // }
            // if ($("#fundDesignation2 option:selected").val() !== "0") {
            // 	designationID = $("#fundDesignation2 option:selected").val();
            // }
            // tribute (honoree) attributes
            if ($("input#tribute:checked").length !== 0) {
                if ($("#tributeType:visible").length !== 0) {
                    var tributeType = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Tribute Gift Type"
                        ],
                        Value: $("#tributeType").val(),
                    };
                    customAttributes.push(tributeType);
                }
                if (
                    $("#honoreeFirstName").length !== 0 &&
                    $("#honoreeLastName").length !== 0
                ) {
                    var honoreeName = {
                        AttributeId: BBI.Defaults.customADFAttributes["Honoree Name"],
                        Value: $("#honoreeFirstName").val() +
                            " " +
                            $("#honoreeLastName").val(),
                    };
                    customAttributes.push(honoreeName);
                }
            }
            // acknowledgee attributes
            if ($("input#ackCheck:checked").length !== 0) {
                if (
                    $("#ackTitle").length !== 0 &&
                    $("#ackTitle").val() !== "-1"
                ) {
                    var ackTitle = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Title"
                        ],
                        Value: $("#ackTitle option:selected").text(),
                    };
                    customAttributes.push(ackTitle);
                }
                if ($("#ackFirstName").length !== 0) {
                    var ackFirstName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee First Name"
                        ],
                        Value: $("#ackFirstName").val(),
                    };
                    customAttributes.push(ackFirstName);
                }
                if ($("#ackLastName").length !== 0) {
                    var ackLastName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Last Name"
                        ],
                        Value: $("#ackLastName").val(),
                    };
                    customAttributes.push(ackLastName);
                }
                if ($("#ackAddressLines").length !== 0) {
                    var ackAddress = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Address"
                        ],
                        Value: $("#ackAddressLines").val(),
                    };
                    customAttributes.push(ackAddress);
                }
                if ($("#ackCity").length !== 0) {
                    var ackCity = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee City"
                        ],
                        Value: $("#ackCity").val(),
                    };
                    customAttributes.push(ackCity);
                }
                if ($("#ackState").length !== 0) {
                    var ackState = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee State"
                        ],
                        Value: $("#ackState").val(),
                    };
                    customAttributes.push(ackState);
                }
                if ($("#ackPostalCode").length !== 0) {
                    var ackZip = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Zip"
                        ],
                        Value: $("#ackPostalCode").val(),
                    };
                    customAttributes.push(ackZip);
                }
                if ($("#ackCountry").length !== 0) {
                    var ackCountry = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Country"
                        ],
                        Value: $("#ackCountry").val(),
                    };
                    customAttributes.push(ackCountry);
                }
                if (
                    $("#ackPhone").length !== 0 &&
                    $("#ackPhone").val() !== ""
                ) {
                    var ackPhone = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Phone"
                        ],
                        Value: $("#ackPhone").val(),
                    };
                    customAttributes.push(ackPhone);
                }
                if (
                    $("#ackEmail").length !== 0 &&
                    $("#ackEmail").val() !== ""
                ) {
                    var ackEmail = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Email"
                        ],
                        Value: $("#ackEmail").val(),
                    };
                    customAttributes.push(ackEmail);
                }
            }
            if ($("#company:visible").length !== 0) {
                console.log($("#company").val());
                var company = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Matching Gift Company"
                    ],
                    Value: $("#company").val(),
                };
                customAttributes.push(company);
            }
            if ($("#spouseName:visible").length !== 0) {
                var spouseName = {
                    AttributeId: BBI.Defaults.customADFAttributes["Joint Spouse Name"],
                    Value: $("#spouseName").val(),
                };
                customAttributes.push(spouseName);
            }
            if ($("#pledgeID:visible").length !== 0) {
                console.log($("#pledgeID").val());
                var pledge = {
                    AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                    Value: $("#pledgeID").val(),
                };
                customAttributes.push(pledge);
            }
            if ($("#frequency:visible").length !== 0) {
                console.log($("#frequency option:selected").val());
                var startDate = $("#startDate").datepicker("getDate"), //Date.parse();
                    DayOfWeek = startDate.getDay(),
                    DayOfMonth = startDate.getDate(),
                    StartMonth = startDate.getMonth(),
                    frequency = $("#frequency").val();
                // var endDate = $("#endDate").val().length !== 0 ? $("#endDate").val() : null;
                if (frequency == 1) {
                    donation.Gift["Recurrence"] = {
                        DayOfWeek: DayOfWeek,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else if (frequency == 2) {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                }
            }
            if (
                $("#otherArea:visible").length !== 0 &&
                $("#otherArea:visible").val().length > 0
            ) {
                var otherArea = {
                    Value: $("#otherArea").val(),
                };
                donation.Gift.Comments.push(otherArea);
            }
            donation.Gift.Attributes = customAttributes;
            // one-time gift
            var getGiftType = $(".toggleGiftType input:checked").val();
            if (getGiftType == "OneTime" || getGiftType == "Monthly") {
                var giftRow = $("#giftListNotEmpty > table > tbody > tr");
                $.each(giftRow, function() {
                    var fundAmount = $(this)
                        .find("input")
                        .val()
                        .trim();
                    var fundDesignation = $(this)
                        .find(".fund-designation")
                        .text();
                    var gift = {
                        Amount: fundAmount,
                        DesignationId: fundDesignation,
                    };
                    designationArray.push(gift);
                });
                donation.Gift.Designations = designationArray;
                // console.log(donation.Gift.Designations);
                // pledge gift
            } else {
                donation.Gift.Designations = [{
                    Amount: $("#hiddenAmount").val(),
                    DesignationId: BBI.Defaults.pledgeFund,
                }, ];
            }
            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(data);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                $("#adfSubmitButtonQS")
                    .on("click", function(e) {
                        e.preventDefault();
                        // if (BBI.Methods.validateADF()) {
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.submitQueryADF();
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
        },

        submitCustomADF: function() {
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $(".miniInputText.currency").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [],
                    IsAnonymous: false,
                    MerchantAccountId: BBI.Defaults.MerchantAccountId,
                },
            };

            function getAllUrlParams(url) {
                var queryString = url ?
                    url.split("?")[1] :
                    window.location.search.slice(1);
                var obj = {};
                if (queryString) {
                    queryString = queryString.split("#")[0];
                    var arr = queryString.split("&");
                    for (var i = 0; i < arr.length; i++) {
                        var a = arr[i].split("=");
                        var paramName = a[0];
                        var paramValue =
                            typeof a[1] === "undefined" ? true : a[1];
                        paramName = paramName.toLowerCase();
                        if (typeof paramValue === "string")
                            paramValue = paramValue.toLowerCase();
                        if (paramName.match(/\[(\d+)?\]$/)) {
                            var key = paramName.replace(/\[(\d+)?\]/, "");
                            if (!obj[key]) obj[key] = [];
                            if (paramName.match(/\[\d+\]$/)) {
                                var index = /\[(\d+)\]/.exec(paramName)[1];
                                obj[key][index] = paramValue;
                            } else {
                                obj[key].push(paramValue);
                            }
                        } else {
                            if (!obj[paramName]) {
                                obj[paramName] = paramValue;
                            } else if (
                                obj[paramName] &&
                                typeof obj[paramName] === "string"
                            ) {
                                obj[paramName] = [obj[paramName]];
                                obj[paramName].push(paramValue);
                            } else {
                                obj[paramName].push(paramValue);
                            }
                        }
                    }
                }
                return obj;
            }
            var params = document.getElementById("params");
            var results = document.getElementById("results");
            document
                .querySelector("input")
                .addEventListener("keyup", function() {
                    params.innerText = this.value;
                    results.innerText = JSON.stringify(
                        getAllUrlParams("http://test.com/?" + this.value),
                        null,
                        2
                    );
                });
            if ($("#anonymous:checked").length !== 0) {
                donation.Gift.IsAnonymous = true;
            }
            donation.Gift.Attributes = customAttributes;
            var fundAmount = $("#customAmount[type=radio]").val();
            var fundDesignation = $("#hiddenGuid").val();
            var gift = {
                Amount: fundAmount,
                DesignationId: fundDesignation,
            };
            designationArray.push(gift);
            donation.Gift.Designations = designationArray;
            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(data);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                $("#adfSubmitButtonCustom")
                    .on("click", function(e) {
                        e.preventDefault();
                        if (BBI.Methods.validateADF()) {
                            $(this)
                                .addClass("disabled")
                                .unbind("click");
                            BBI.Methods.submitCustomADF();
                        }
                    })
                    .removeClass("disabled");
            };
            // console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );
        },

        gf2SubmitADF: function() {
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
                    Designations: [],
                    IsAnonymous: false,
                    MerchantAccountId: BBI.Defaults.MerchantAccountId,
                },
            };

            let fundGuid = document.getElementById('fundSelect').value.trim();

            var gift = {
                Amount: giftAmount,
                DesignationId: fundGuid,
            };
            designationArray.push(gift);

            donation.Gift.Designations = designationArray;

            donation.Gift["Recurrence"] = {
                DayOfWeek: 1,
                Frequency: 1,
                StartDate: "Fri Jan 15 2021",
                EndDate: "Fri Jan 22 2021"
            }

            // if ($("#frequency:visible").length !== 0) {
            //     var startDate = $("#startDate").datepicker("getDate"), //Date.parse();
            //         DayOfWeek = startDate.getDay(),
            //         DayOfMonth = startDate.getDate(),
            //         StartMonth = startDate.getMonth(),
            //         frequency = $("#frequency").val();
            //     donation.Gift["Recurrence"] = {
            //         DayOfMonth: DayOfMonth,
            //         Frequency: frequency,
            //         StartDate: startDate,
            //         // EndDate: endDate
            //     }
            // }

            // other scripts

            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                console.log(data);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                $("#adfSubmitButton")
                    .on("click", function(e) {
                        e.preventDefault();
                        // if (BBI.Methods.validateADF()) {
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.submitADF();
                        // }
                    })
                    .removeClass("disabled");
            };
            console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );
        },

        submitADF: function() {
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $(".miniInputText.currency").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [],
                    IsAnonymous: false,
                    MerchantAccountId: BBI.Defaults.MerchantAccountId,
                },
            };

            function getAllUrlParams(url) {
                var queryString = url ?
                    url.split("?")[1] :
                    window.location.search.slice(1);
                var obj = {};
                if (queryString) {
                    queryString = queryString.split("#")[0];
                    var arr = queryString.split("&");
                    for (var i = 0; i < arr.length; i++) {
                        var a = arr[i].split("=");
                        var paramName = a[0];
                        var paramValue =
                            typeof a[1] === "undefined" ? true : a[1];
                        paramName = paramName.toLowerCase();
                        if (typeof paramValue === "string")
                            paramValue = paramValue.toLowerCase();
                        if (paramName.match(/\[(\d+)?\]$/)) {
                            var key = paramName.replace(/\[(\d+)?\]/, "");
                            if (!obj[key]) obj[key] = [];
                            if (paramName.match(/\[\d+\]$/)) {
                                var index = /\[(\d+)\]/.exec(paramName)[1];
                                obj[key][index] = paramValue;
                            } else {
                                obj[key].push(paramValue);
                            }
                        } else {
                            if (!obj[paramName]) {
                                obj[paramName] = paramValue;
                            } else if (
                                obj[paramName] &&
                                typeof obj[paramName] === "string"
                            ) {
                                obj[paramName] = [obj[paramName]];
                                obj[paramName].push(paramValue);
                            } else {
                                obj[paramName].push(paramValue);
                            }
                        }
                    }
                }
                return obj;
            }
            var params = document.getElementById("params");
            var results = document.getElementById("results");
            document
                .querySelector("input")
                .addEventListener("keyup", function() {
                    params.innerText = this.value;
                    results.innerText = JSON.stringify(
                        getAllUrlParams("http://test.com/?" + this.value),
                        null,
                        2
                    );
                });
            var getUrlParameter = function getUrlParameter(sParam) {
                var sPageURL = window.location.search.substring(1),
                    sURLVariables = sPageURL.split("&"),
                    sParameterName,
                    i;
                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split("=");
                    if (sParameterName[0] === sParam) {
                        return sParameterName[1] === undefined ?
                            true :
                            decodeURIComponent(
                                sParameterName[1].toLowerCase()
                            );
                    }
                }
            };
            var urlAppealId = getUrlParameter("appeal");
            var urlFinderNumber = getUrlParameter("efndnum");
            if (urlAppealId) {
                var origin = {
                    AppealId: urlAppealId,
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    //, "PageName": "Advanced Donation Form"
                };
                donation.Origin = origin;
            }
            if (urlFinderNumber) {
                donation.Gift.FinderNumber = urlFinderNumber;
            }
            if (window.location.href.indexOf("giving-page") > -1) {
                var origin = {
                    AppealId: "6740fcbf-aa98-44bf-87d2-a69ba1f8d216",
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    //, "PageName": "Advanced Donation Form"
                };
                donation.Origin = origin;
            }
            // if the path contains "/givetoday",
            // this is an appeal, so let's add the ID
            if (
                window.location.pathname.toLowerCase().startsWith("/givetoday")
            ) {
                var origin = {
                    AppealId: "BF7730F5-C275-4C2F-A08C-A33A29F2FBBA",
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    //, "PageName": "Advanced Donation Form"
                };
                donation.Origin = origin;
            }
            // if the path contains "/impact2016"
            // Appeal: FY17 Faculty & Staff Campaign CYE2016
            // this is an appeal, so let's add the ID
            if (
                window.location.pathname.toLowerCase().startsWith("/impact2016")
            ) {
                var origin = {
                    AppealId: "b76d6373-51f0-4268-a35c-92bb1c8de65f",
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    //, "PageName": "Advanced Donation Form"
                };
                donation.Origin = origin;
            }
            // if the path contains "/impact16"
            // Appeal: FY17 Faculty & Staff Campaign CYE16
            // this is an appeal, so let's add the ID
            if (
                window.location.pathname.toLowerCase().startsWith("/givetoday")
            ) {
                var origin = {
                    AppealId: "55a0b0ac-ed24-470e-b42f-5a537eca152f",
                    PageId: BLACKBAUD.api.pageInformation.pageId,
                    //, "PageName": "Advanced Donation Form"
                };
                donation.Origin = origin;
            }

            if ( window.location.pathname.toLowerCase().startsWith("/fye") ) {
                var origin = {
                    // AppealId: "07690458-068e-409d-90ea-ff2e605b6a11",
                    AppealId: "96eacba5-3a64-4c20-9461-63a743044717",
                    PageId: BLACKBAUD.api.pageInformation.pageId
                };
                donation.Origin = origin;
            }

            if ($("#anonymous:checked").length !== 0) {
                donation.Gift.IsAnonymous = true;
            }
            //other area free text entry
            if ($("#giftListNotEmpty .otherDesignation").length !== 0) {
                donation.Gift.Comments =
                    "Area of support: " +
                    $("#giftListNotEmpty .otherDesignation .fund-name").text();
            }
            if ($("#fundDesignation2 option:selected").val() !== "0") {
                designationID = $("#fundDesignation2 option:selected").val();
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
            if ($("input#tribute:checked").length !== 0) {
                if ($("#tributeType:visible").length !== 0) {
                    var tributeType = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Tribute Gift Type"
                        ],
                        Value: $("#tributeType").val(),
                    };
                    customAttributes.push(tributeType);
                }
                if (
                    $("#honoreeFirstName").length !== 0 &&
                    $("#honoreeLastName").length !== 0
                ) {
                    var honoreeName = {
                        AttributeId: BBI.Defaults.customADFAttributes["Honoree Name"],
                        Value: $("#honoreeFirstName").val() +
                            " " +
                            $("#honoreeLastName").val(),
                    };
                    customAttributes.push(honoreeName);
                }
            }
            // acknowledgee attributes
            if ($("input#ackCheck:checked").length !== 0) {
                if (
                    $("#ackTitle").length !== 0 &&
                    $("#ackTitle").val() !== "-1"
                ) {
                    var ackTitle = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Title"
                        ],
                        Value: $("#ackTitle option:selected").text(),
                    };
                    customAttributes.push(ackTitle);
                }
                if ($("#ackFirstName").length !== 0) {
                    var ackFirstName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee First Name"
                        ],
                        Value: $("#ackFirstName").val(),
                    };
                    customAttributes.push(ackFirstName);
                }
                if ($("#ackLastName").length !== 0) {
                    var ackLastName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Last Name"
                        ],
                        Value: $("#ackLastName").val(),
                    };
                    customAttributes.push(ackLastName);
                }
                if ($("#ackAddressLines").length !== 0) {
                    var ackAddress = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Address"
                        ],
                        Value: $("#ackAddressLines").val(),
                    };
                    customAttributes.push(ackAddress);
                }
                if ($("#ackCity").length !== 0) {
                    var ackCity = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee City"
                        ],
                        Value: $("#ackCity").val(),
                    };
                    customAttributes.push(ackCity);
                }
                if ($("#ackState").length !== 0) {
                    var ackState = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee State"
                        ],
                        Value: $("#ackState").val(),
                    };
                    customAttributes.push(ackState);
                }
                if ($("#ackPostalCode").length !== 0) {
                    var ackZip = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Zip"
                        ],
                        Value: $("#ackPostalCode").val(),
                    };
                    customAttributes.push(ackZip);
                }
                if ($("#ackCountry").length !== 0) {
                    var ackCountry = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Country"
                        ],
                        Value: $("#ackCountry").val(),
                    };
                    customAttributes.push(ackCountry);
                }
                if (
                    $("#ackPhone").length !== 0 &&
                    $("#ackPhone").val() !== ""
                ) {
                    var ackPhone = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Phone"
                        ],
                        Value: $("#ackPhone").val(),
                    };
                    customAttributes.push(ackPhone);
                }
                if (
                    $("#ackEmail").length !== 0 &&
                    $("#ackEmail").val() !== ""
                ) {
                    var ackEmail = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Email"
                        ],
                        Value: $("#ackEmail").val(),
                    };
                    customAttributes.push(ackEmail);
                }
            }
            if ($("#company:visible").length !== 0) {
                // console.log($("#company").val());
                var company = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Matching Gift Company"
                    ],
                    Value: $("#company").val(),
                };
                customAttributes.push(company);
            }
            if ($("#spouseName:visible").length !== 0) {
                var spouseName = {
                    AttributeId: BBI.Defaults.customADFAttributes["Joint Spouse Name"],
                    Value: $("#spouseName").val(),
                };
                customAttributes.push(spouseName);
            }
            if ($("#pledgeID:visible").length !== 0) {
                // console.log($("#pledgeID").val());
                var pledge = {
                    AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                    Value: $("#pledgeID").val(),
                };
                customAttributes.push(pledge);
            }
            if ($("#frequency:visible").length !== 0) {
                // console.log($("#frequency option:selected").val());
                var startDate = $("#startDate").datepicker("getDate"), //Date.parse();
                    DayOfWeek = startDate.getDay(),
                    DayOfMonth = startDate.getDate(),
                    StartMonth = startDate.getMonth(),
                    frequency = $("#frequency").val();
                // var endDate = $("#endDate").val().length !== 0 ? $("#endDate").val() : null;
                if (frequency == 1) {
                    donation.Gift["Recurrence"] = {
                        DayOfWeek: DayOfWeek,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else if (frequency == 2) {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                }
            }
            if (
                $("#otherArea:visible").length !== 0 &&
                $("#otherArea:visible").val().length > 0
            ) {
                var otherArea = {
                    Value: $("#otherArea").val(),
                };
                donation.Gift.Comments.push(otherArea);
            }
            donation.Gift.Attributes = customAttributes;
            // one-time gift
            if (
                $("#tabOneTime, #tabRecurring")
                .parent()
                .hasClass("selected")
            ) {
                var giftRow = $("#giftListNotEmpty > table > tbody > tr");
                $.each(giftRow, function() {
                    var fundAmount = $(this)
                        .find(".fund-amount")
                        .text()
                        .replace("$", "");
                    var fundDesignation = $(this)
                        .find(".fund-designation")
                        .text();
                    var gift = {
                        Amount: fundAmount,
                        DesignationId: fundDesignation,
                    };
                    designationArray.push(gift);
                });
                donation.Gift.Designations = designationArray;
                // console.log(donation.Gift.Designations);
                // pledge gift
            } else {
                if ($(".amountButton a").hasClass("selected")) {
                    donation.Gift.Designations = [{
                        Amount: $(".amountButton a.selected").attr("rel"),
                        DesignationId: BBI.Defaults.pledgeFund,
                    }, ];
                } else if (!$(".amountButton").hasClass("selected") &&
                    $("#txtAmount2").val() !== ""
                ) {
                    donation.Gift.Designations = [{
                        Amount: $("#txtAmount2").val(),
                        DesignationId: BBI.Defaults.pledgeFund,
                    }, ];
                }
            }
            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(data);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                $("#adfSubmitButton")
                    .on("click", function(e) {
                        e.preventDefault();
                        if (BBI.Methods.validateADF()) {
                            $(this)
                                .addClass("disabled")
                                .unbind("click");
                            BBI.Methods.submitADF();
                        }
                    })
                    .removeClass("disabled");
            };
            // console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );
        },
        convertErrorToString: function(error) {
            if (error) {
                if (error.Message) return error.Message;
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
            var i,
                message = "Unknown error.<br/>";
            if (errors) {
                message = "";
                for (i = 0; i < errors.length; i++) {
                    message =
                        message +
                        BBI.Methods.convertErrorToString(errors[i]) +
                        "<br/>";
                }
            }
            return message;
        },
        adminStyleFixes: function() {
            $(
                '[class*="show-for-"], [class*="hide-for-"], .fullWidthBackgroundImage, .fullWidthBackgroundImageInner'
            ).attr("class", "");
            $("header div")
                .not('[id^="pane"], [id^="pane"] div')
                .css("position", "static");
            $(".fullWidthBackgroundImageInner").show();
        },
        getUrlVars: function() {
            // Gets variables and values from URL
            var vars = {};
            var parts = window.location.href.replace(
                /[?&]+([^=&]+)=([^&]*)/gi,
                function(m, key, value) {
                    vars[key] = unescape(value.replace(/\+/g, " "));
                }
            );
            return vars;
        },
        returnQueryValueByName: function(name) {
            return BLACKBAUD.api.querystring.getQueryStringValue(name);
        },
        fixPositioning: function() {
            // Fix positioning:
            $('div[id *= "_panelPopup"]').appendTo("body");
            $('div[id *= "_designPaneCloak"]').css({
                top: "0px",
                left: "0px",
            });
            $(".DesignPane").css("position", "relative");
        },
        setCookie: function(c_name, value, exdays) {
            var exdate = new Date();
            //allows for reading cookies across subdomains
            var cd = window.location.host.substr(
                window.location.host.indexOf(".")
            );
            exdate.setDate(exdate.getDate() + exdays);
            var c_value =
                escape(value) +
                (exdays == null ? "" : "; expires=" + exdate.toUTCString());
            document.cookie =
                c_name + "=" + c_value + "; domain=" + cd + "; path=/";
        },
        readCookie: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";");
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0)
                    return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        initMobileHeader: function() {
            $("#mobileLogo").headroom({
                offset: 80,
            });
        },
        mobileSubMenu: function() {
            $(".mobileCanvas.rightCanvas ul.menu li.parent > a").click(function(
                event
            ) {
                if (
                    $(this)
                    .parent()
                    .hasClass("open")
                ) {
                    // open link
                } else {
                    event.preventDefault();
                    $(this)
                        .parent()
                        .toggleClass("open");
                    $(this)
                        .next()
                        .slideToggle();
                }
            });
        },

        urlParameterCheck: function() {
            // autopopulate designation from url
            var type = BBI.Methods.returnQueryValueByName("type"),
                pledgeId = BBI.Methods.returnQueryValueByName("pledgeid"),
                typeSelect = $("#giftTypeSelect");

            if (!!type) {
                console.log(type);
                if (type == "monthly") {
                    typeSelect.val("Monthly");
                    $("fieldset.Pledge.toggle").addClass("hide");
                    $("fieldset.Monthly.toggle, fieldset.fundSelect").removeClass("hide");
                    $("fieldset#giftSummary").removeClass("hide");
                    $("fieldset.fundSelect, #queryLoader").removeClass("hide");
                } else if (type == "pledge") {
                    typeSelect.val("Pledge");
                    $("#pledgeId").val(pledgeId);
                    $("fieldset.Monthly.toggle, fieldset.fundSelect").addClass("hide");
                    $("fieldset.Pledge.toggle").removeClass("hide");
                    $("fieldset#giftSummary").addClass("hide");
                    $("fieldset.fundSelect, #queryLoader").addClass("hide");
                } else {
                    $("fieldset.toggle").addClass("hide");
                    $("fieldset.fundSelect").removeClass("hide");
                    $("fieldset#giftSummary, #queryLoader").removeClass("hide");
                }
            }

            // Check if 'type' query parameter is set to monthly (not case-sensitive)
            var getUrlParameter = function getUrlParameter(sParam) {
                var sPageURL = window.location.search.substring(1),
                    sURLVariables = sPageURL.split("&"),
                    sParameterName,
                    i;
                for (i = 0; i < sURLVariables.length; i++) {
                    sParameterName = sURLVariables[i].split("=");
                    if (sParameterName[0] === sParam) {
                        return sParameterName[1] === undefined ?
                            true :
                            decodeURIComponent(
                                sParameterName[1].toLowerCase()
                            );
                    }
                }
            };
            var urlFund = getUrlParameter("fund");
            var urlUnit = getUrlParameter("unit");

            function urlParameterCheck() {
                setTimeout(function() {
                    $("select#collegeUnitsSelect")
                        .find('option[value^="' + urlUnit + '"]')
                        .prop("selected", true);

                    if (urlFund) {
                        var $select = $('.toggle .select-section .select select');
                        // var $selectName = $select.val(urlFund).parents(".toggle").attr("id");


                        // $("select#collegeUnitsFundSelect")
                        $("select")
                            .delay(500)
                            .find('option[value="' + urlFund + '"]')
                            .prop("selected", true)
                            .trigger("change").parents(".toggle").addClass("showSelect");

                        $("#areasToSuppportRadioGroup div.toggle").not(".showSelect").hide();

                        // $("#areasToSuppportRadioGroup .toggle").not(".showSelect").hide();

                        // console.log($selectName);
                    } else {
                        // console.log("false: " + urlFund);
                    }
                    // console.log(urlUnit);
                }, 750);
            }
            urlParameterCheck();
        },

        // URL query parameters
        queryParameters: function() {
            // if finder number is in URL (core BBIS functionality)
            // if (!!BBI.Methods.returnQueryValueByName('efndnum')) {
            //     let finderNumber = BBI.Methods.returnQueryValueByName('efndnum');
            //     $("#finderNumber").val(finderNumber);
            // }

            const capitalize = (s) => {
                if (typeof s !== 'string') return ''
                return s.charAt(0).toUpperCase() + s.slice(1)
            }

            const capitalize_Words = (str) => {
                if (typeof str !== 'string') return ''
                return str.replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            }

            if (!!BBI.Methods.returnQueryValueByName('fname')) {
                $('#personalFirstName').val(capitalize(BBI.Methods.returnQueryValueByName('fname')));
            }

            if (!!BBI.Methods.returnQueryValueByName('lname')) {
                $('#personalLastName').val(capitalize(BBI.Methods.returnQueryValueByName('lname')));
            }

            if (!!BBI.Methods.returnQueryValueByName('adr')) {
                $('#personalAddress').val(capitalize_Words(BBI.Methods.returnQueryValueByName('adr')));
            }

            // if (!!BBI.Methods.returnQueryValueByName('adrtp')) {
            //     $('#personalAddressType option:selected').text(capitalize(BBI.Methods.returnQueryValueByName('adrtp')));
            // }

            if (!!BBI.Methods.returnQueryValueByName('cty')) {
                $('#personalCity').val(capitalize(BBI.Methods.returnQueryValueByName('cty')));
            }

            if (!!BBI.Methods.returnQueryValueByName('st')) {
                $('#personalState').val(BBI.Methods.returnQueryValueByName('st').toUpperCase());
            }

            if (!!BBI.Methods.returnQueryValueByName('zp')) {
                $('#personalZip').val(BBI.Methods.returnQueryValueByName('zp'));
            }

            if (!!BBI.Methods.returnQueryValueByName('ph')) {
                $('#personalPhone').val(BBI.Methods.returnQueryValueByName('ph'));
            }

            if (!!BBI.Methods.returnQueryValueByName('eml')) {
                $('#personalEmail').val(BBI.Methods.returnQueryValueByName('eml'));
            }

            // if (!!BBI.Methods.returnQueryValueByName('emltp')) {
            //     $('#personalEmailType option:selected').text(capitalize(BBI.Methods.returnQueryValueByName('emltp')));
            // }
        },

        datePicker: function() {
            if ($("#startDate:visible").length !== 0) {
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
                $("#startDate").datepicker("setDate", getMinDate());
            }
        },
        /**********************************************
        CUSTOM DONATION FORM
           Broken Down into 3 Objects by Step
        ***********************************************/
        customSingleDonationForm: {
            // Add Classes to parent Tbody of each section of the hidden form
            tbodyClasses: function() {
                // Set Vars
                var donationInfo,
                    additionalInfo,
                    designationSelectList,
                    billingInfo,
                    tributeInfo,
                    paymentInfo;
                // Donation Information/Amount
                donationInfo = $('[id*="txtAmount"]')
                    .parents("tbody")
                    .addClass("donationInfo");
                // Additional Information
                additionalInfo = $('[id*="trDesignation"]')
                    .parents("tbody")
                    .addClass("additionalInfo");
                // Billing Information
                billingInfo = $('[id*="DonationCapture1_txtFirstName"]')
                    .parents("tbody")
                    .addClass("billingInfo");
                // Tribute Information
                tributeInfo = $('[id*="lblTributeHeading"]')
                    .parents("tbody")
                    .addClass("tributeInfo");
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
                    hiddenFundDesgList = $(
                            '.additionalInfo select[id*="ddlDesignations"]'
                        )
                        .children()
                        .clone();
                    $('<select id="fundDesignList"></select>').prependTo(
                        "ul.fundDesignation li.fundDesignationList"
                    );
                    shownFundList = "select#fundDesignList";
                    if (
                        $(
                            "ul.fundDesignation li.fundDesignationList select option"
                        ).length === 0
                    ) {
                        $(hiddenFundDesgList).prependTo(shownFundList);
                    }
                    $("select#fundDesignList option").click(function() {
                        $("select#fundDesignList option:selected").removeAttr(
                            "checked",
                            "true"
                        );
                        $(this).attr("checked", "true");
                    });
                    // Match Selected Fund to Hidden Fund
                    $(shownFundList).on("change", function() {
                        var shownFundListSelected = $(
                            "select#fundDesignList option:selected"
                        );
                        var hiddenFundList =
                            '.additionalInfo select[id*="ddlDesignations"]';
                        $(hiddenFundList)
                            .find(
                                'option[value="' +
                                shownFundListSelected.val() +
                                '"]'
                            )
                            .attr("selected", true);
                    });
                },
                clickHiddenAmount: function() {
                    $('input[value="rdoOther"]').click(); // auto-select "Other" amount option in hidden form (on page load)
                    var checkedRadio = $(
                        '.givingAmountOptions input[name="amount"]:checked'
                    ).val(); // set initial val for :checked option (on page load)
                    $('.DonationFormTable input[id$="txtAmount"]').val(
                        checkedRadio
                    );
                },
                // Donation Amount
                donationAmount: function() {
                    $("#addToCart a").on("click", function() {
                        var sum = 0;
                        // iterate through each amount cell and add the values
                        $(".fund-amount").each(function() {
                            var value = $(this)
                                .text()
                                .replace("$", "");
                            // add only if the value is number
                            if (!isNaN(value) && value.length != 0) {
                                sum += parseFloat(value);
                            }
                            $(".adfTotalAmount span").text(sum);
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
                },
            },
            /**********************************************
            Step 2 - GET DONOR NAME AND BILLING INFO
            ***********************************************/
            stepTwoDonorInfo: {
                // STEP 2A: GET BILLING NAME
                billingName: function() {
                    var billingFirstName,
                        billingLastName,
                        hiddenFirstName,
                        hiddenLastName;
                    billingFirstName = ".donorFirstName #billingFirstName";
                    billingLastName = ".donorLastName #billingLastName";
                    hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                    hiddenLastName = '.billingInfo [id*="txtLastName"]';
                    // Get First Name entered
                    $(billingFirstName).blur(function() {
                        var billingFirstNameEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenFirstName).val(billingFirstNameEnt);
                        }
                    });
                    // Get Last Name entered
                    $(billingLastName).blur(function() {
                        var billingLastNameEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenLastName).val(billingLastNameEnt);
                        }
                    });
                },
                // STEP 2B: GET BILLING ADDRESS
                billingAddress: function() {
                    var billingAddress, hiddenBillingAddress;
                    billingAddress = ".personalInfoList #billingAddress";
                    hiddenBillingAddress = '.billingInfo [id*="AddressLine"]';
                    // Get Address entered
                    $(billingAddress).change(function() {
                        var billingAddressEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenBillingAddress).val(billingAddressEnt);
                        }
                    });
                },
                // STEP 2C: GET BILLING Title
                billingTitleList: function() {
                    var shownTitleList, hiddenTitleList;
                    hiddenTitleList = $(
                            '.DonationCaptureFormTable select[id*="Title"]'
                        )
                        .children()
                        .clone();
                    shownTitleList = ".donorTitle select#nameTitleList";
                    if ($("select#nameTitleList option").length === 0) {
                        $(hiddenTitleList).prependTo(shownTitleList);
                    }
                    $("#nameTitleList option:eq(0)").text("Title");
                    $("select#nameTitleList option").click(function() {
                        $("select#nameTitleList option:selected").removeAttr(
                            "checked",
                            "true"
                        );
                        $(this).attr("checked", "true");
                    });
                    // Match Selected Fund to Hidden Fund
                    $(shownTitleList).on("change", function() {
                        var shownTitleListSelected = $(
                            "select#nameTitleList option:selected"
                        );
                        var hiddenTitleList =
                            '.DonationCaptureFormTable select[id*="Title"]';
                        $(hiddenTitleList)
                            .find(
                                'option[value="' +
                                shownTitleListSelected.val() +
                                '"]'
                            )
                            .attr("selected", true);
                    });
                },
                // STEP 2D: GET BILLING City
                billingCity: function() {
                    var billingCity, hiddenCity;
                    billingCity = ".wrapCity #billingCity";
                    hiddenCity = '.billingInfo [id*="City"]';
                    // Get City entered
                    $(billingCity).blur(function() {
                        var billingCityEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenCity).val(billingCityEnt);
                        }
                    });
                },
                // STEP 2E: GET BILLING COUNTRY
                billingCountryList: function() {
                    var shownCountryList, hiddenCountryList;
                    hiddenCountryList = $(
                            '.DonationCaptureFormTable [id*="Country"]'
                        )
                        .children()
                        .clone();
                    shownCountryList = "select#billingCountry";
                    if ($("select#billingCountry option").length === 0) {
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
                    $("select#billingCountry option").click(function() {
                        var shownCountryListSelected = $(
                            "select#billingCountry option:selected"
                        );
                        var hiddenCountryList =
                            '.DonationCaptureFormTable [id*="Country"]';
                        $(hiddenCountryList)
                            .find(
                                'option[value="' +
                                shownCountryListSelected.val() +
                                '"]'
                            )
                            .attr("selected", true);
                        var hiddenCountrySelected = $(
                            '.DonationCaptureFormTable [id*="Country"]'
                        ).find("option:selected");
                        // $(hiddenCountrySelected).trigger('change');
                        // console.log(hiddenCountrySelected);
                    });
                },
                // STEP 2F: GET BILLING STATE
                billingStateList: function() {
                    var shownStateList, hiddenStateList;
                    hiddenStateList = $(
                            '.DonationCaptureFormTable [id*="State"]'
                        )
                        .children()
                        .clone();
                    shownStateList = "select#billingState";
                    if ($("select#billingState option").length === 0) {
                        $(hiddenStateList).prependTo(shownStateList);
                    }
                    $("#billingState option:eq(0)").text("State");
                    $("select#billingState option").click(function() {
                        $("select#billingState option:selected").removeAttr(
                            "checked",
                            "true"
                        );
                        $(this).attr("checked", "true");
                    });
                    // Match Selected State to Hidden State
                    $(shownStateList).on("change", function() {
                        var shownStateListSelected = $(
                            "select#billingState option:selected"
                        );
                        var hiddenStateList =
                            '.DonationCaptureFormTable [id*="State"]';
                        $(hiddenStateList)
                            .find(
                                'option[value="' +
                                shownStateListSelected.val() +
                                '"]'
                            )
                            .attr("selected", true);
                    });
                },
                // STEP 2G: GET BILLING ZIP
                billingZip: function() {
                    var billingZip, hiddenZip;
                    billingZip = ".wrapZip #zip";
                    hiddenZip = '.DonationFormTable [id*="Zip"]';
                    // Grab ZIP entered
                    $(billingZip).blur(function() {
                        var billingZipEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenZip).val(billingZipEnt);
                        }
                    });
                },
                // STEP 2H: GET BILLING PHONE
                billingPhone: function() {
                    var billingPhone, hiddenBillingPhone;
                    billingPhone = ".personalInfoList #billingPhone";
                    hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                    // Grab Phone value
                    $(billingPhone).blur(function() {
                        var billingPhoneEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenBillingPhone).val(billingPhoneEnt);
                        }
                    });
                },
                // STEP 2I: GET BILLING EMAIL
                billingEmail: function() {
                    var billingEmail, hiddenBillingEmail;
                    billingEmail = ".personalInfoList #email";
                    hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                    // Grab Email value
                    $(billingEmail).blur(function() {
                        var billingEmailEnt = $(this).val();
                        if ($(this).val() !== "") {
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
                    cardholder = ".paymentInfo #cardholder";
                    hiddenCardholder = '.paymentInfo [id*="txtCardholder"]';
                    // Get Cardholder Name entered
                    $(cardholder).keyup(function() {
                        var cardHolderEnt = $(this).val();
                        if ($(this).val() !== "") {
                            $(hiddenCardholder).val(cardHolderEnt);
                        }
                    });
                },
                // PART 3B:
                // GET CARD NUMBER, VALIDATE, AND UPDATE CLASS
                cardNumber: function() {
                    var cardNumber,
                        hiddenCardNumber,
                        cardTypeEnt,
                        creditCardValidator,
                        cardTypeVisa,
                        cardTypeMasterCard,
                        cardTypeAmEx,
                        cardTypeDiscover,
                        cardTypeInvalid,
                        cardType;
                    cardNumber = ".paymentInfo #cardNumber";
                    hiddenCardNumber =
                        'table.DonationFormTable input[id*="txtCardNumber"]'; // RegEx Cardnumber Pattern
                    creditCardValidator = new RegExp(
                        /^\d{4}-?\d{4}-?\d{4}-?\d{3,4}$/
                    ); // Visa Card Type
                    cardTypeVisa = new RegExp(/^4$/); // MasterCard Card Type
                    cardTypeMasterCard = new RegExp(/^5$/); // American Express Card Type
                    cardTypeAmEx = new RegExp(/^3$/); // Discover Card Type
                    cardTypeDiscover = new RegExp(/^6$/); // Invalid Card Type
                    cardTypeInvalid = new RegExp(/^(0|1|2|7|8|9)$/); // Dynamic text of card type selected
                    cardType = ".cardTypeEnt";
                    cardTypeEnt = $(cardType).text(); // Get Card Number entered
                    // Match Number to CardType on Keyup
                    $(cardNumber).keyup(function() {
                        // console.log("cardNumber keyup");
                        if (
                            $(this)
                            .val()
                            .match(cardTypeVisa)
                        ) {
                            $(this)
                                .removeClass()
                                .addClass("cardTypeVisa");
                            $(cardType).html("Visa");
                            $(
                                    'table.DonationFormTable select[id*="cboCardType"]'
                                )
                                .find("option:contains(Visa)")
                                .attr("selected", "selected");
                        } else if (
                            $(this)
                            .val()
                            .match(cardTypeMasterCard)
                        ) {
                            $(this)
                                .removeClass()
                                .addClass("cardTypeMasterCard");
                            $(cardType).html("MasterCard");
                            $(
                                    'table.DonationFormTable select[id*="cboCardType"]'
                                )
                                .find("option:contains(MasterCard)")
                                .attr("selected", "selected");
                        } else if (
                            $(this)
                            .val()
                            .match(cardTypeAmEx)
                        ) {
                            $(this)
                                .removeClass()
                                .addClass("cardTypeAmEx");
                            $(cardType).html("American Express");
                            $(
                                    'table.DonationFormTable select[id*="cboCardType"]'
                                )
                                .find("option:contains(American)")
                                .attr("selected", "selected");
                        } else if (
                            $(this)
                            .val()
                            .match(cardTypeDiscover)
                        ) {
                            $(this)
                                .removeClass()
                                .addClass("cardTypeDiscover");
                            $(cardType).html("Discover");
                            $(
                                    'table.DonationFormTable select[id*="cboCardType"]'
                                )
                                .find("option:contains(Discover)")
                                .attr("selected", "selected");
                        } else if (
                            $(this)
                            .val()
                            .match(cardTypeInvalid) ||
                            $(this).val() === ""
                        ) {
                            $(this)
                                .removeClass()
                                .addClass("cardTypeInvalid");
                            $(".cardTypeEnt").text("");
                        }
                    });
                    $(".cardTypeEnt").text(cardTypeEnt); // Get Card Type Based on Card Number
                    // Grab Credit Card value
                    $(cardNumber).keyup(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if (
                            $(this)
                            .val()
                            .match(creditCardValidator)
                        ) {
                            $(this)
                                .removeClass("invalid")
                                .addClass("valid");
                            $(
                                'input[id*="DonationCapture1_txtCardNumber"]'
                            ).val(cardNumEnt);
                        } else {
                            $(this)
                                .removeClass("valid")
                                .addClass("invalid");
                        }
                    });
                    // Validate and Update Class
                    $(cardNumber).blur(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if (
                            $(this)
                            .val()
                            .match(creditCardValidator)
                        ) {
                            $(this)
                                .removeClass("invalid")
                                .addClass("valid");
                            $(
                                'input[id*="DonationCapture1_txtCardNumber"]'
                            ).val(cardNumEnt);
                        } else {
                            $(this)
                                .removeClass("valid")
                                .addClass("invalid");
                        }
                    });
                },
                // PART 3C:
                // CARD EXPIRATION HANDLER
                cardExp: function() {
                    var cardExpMonth,
                        cardExpYear,
                        hiddenCardExpMonth,
                        hiddenCardExpYear,
                        hiddenCardExpMonthClone,
                        hiddenCardExpYearClone; // Card Expiration Month
                    cardExpMonth = "select#cardExpMonth"; // Card Expiration Year
                    cardExpYear = "select#cardExpYr"; // Hidden Exp Month
                    hiddenCardExpMonth =
                        'table.DonationFormTable select[id*="cboMonth"]'; // Hidden Exp Year
                    hiddenCardExpYear =
                        'table.DonationFormTable select[id*="cboYear"]'; // Clone Hidden Exp Month
                    hiddenCardExpMonthClone = $(hiddenCardExpMonth)
                        .children()
                        .clone(); // Clone Hidden Exp Year
                    hiddenCardExpYearClone = $(hiddenCardExpYear)
                        .children()
                        .clone(); // Build Card Exp Year Select list Options
                    if ($("select#cardExpMonth option").length === 0) {
                        $(hiddenCardExpMonthClone).appendTo(
                            "select#cardExpMonth"
                        );
                        $("select#cardExpMonth option:eq(0)").text("Month");
                    }
                    // Grab Card Exp Month
                    $(cardExpMonth).change(function() {
                        var cardExpMonthSelected = $(
                            "select#cardExpMonth :selected"
                        ).val();
                        $(hiddenCardExpMonth)
                            .find(
                                'option:contains("' +
                                cardExpMonthSelected +
                                '")'
                            )
                            .attr("selected", "selected");
                    });
                    // Grab Hidden Values and Append to this Dropdown
                    if ($("select#cardExpYr option").length === 0) {
                        $(hiddenCardExpYearClone).appendTo("select#cardExpYr");
                        $("select#cardExpYr option:eq(0)").text("Year");
                    }
                    // Grab Card Exp Year
                    $(cardExpYear).change(function() {
                        var cardExpYearSelected = $(
                            "select#cardExpYr :selected"
                        ).val();
                        $(hiddenCardExpYear)
                            .find(
                                'option:contains("' + cardExpYearSelected + '")'
                            )
                            .attr("selected", "selected");
                        // console.log('Year selected');
                    });
                },
                // PART 3D:
                // EXTRACT ALL CSC VALUES
                cardCSC: function() {
                    var cardSecCode, cscValidator, hiddenCardSecurityCode;
                    cardSecCode = "input#cscCode"; // Card Security Code
                    cscValidator = new RegExp(/^\d{3,4}$/); // CSC Validation RegEx Pattern
                    hiddenCardSecurityCode =
                        'table.DonationFormTable input[id*="txtCSC"]'; // Hidden/Old Form Vars
                    // Validate CSC Field and Update Class
                    $(cardSecCode).blur(function() {
                        var cscEnt = $(cardSecCode).val();
                        if (!$(this)
                            .val()
                            .match(cscValidator)
                        ) {
                            $(this).addClass("invalid");
                        } else {
                            $(this)
                                .removeClass("invalid")
                                .addClass("valid");
                            $(hiddenCardSecurityCode).val(cscEnt);
                            //$('.paymentInfo ul.paymentInfo li[class*="card"]').addClass('siblingsComplete');
                            $(".paymentInfo h3").addClass("complete");
                        }
                    });
                },
                // PART 6: STORE HIDDEN DATA AND UPDATE IF NEEDED
                hiddenDataPersistence: function() {
                    var error = $("div[id$=ValidationSummary1]");
                    if (error.children().length > 0) {
                        var billingFirstName =
                            ".donorFirstName #billingFirstName";
                        var hiddenFirstName =
                            '.billingInfo [id*="txtFirstName"]';
                        var hiddenFirstNameEnt = $(hiddenFirstName).val();
                        $(billingFirstName).val(hiddenFirstNameEnt);
                        var billingLastName = ".donorLastName #billingLastName";
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var hiddenLastNameEnt = $(hiddenLastName).val();
                        $(billingLastName).val(hiddenLastNameEnt);
                        var billingAddress =
                            ".personalInfoList #billingAddress";
                        var hiddenBillingAddress =
                            'textarea[id$="AddressLine"]';
                        var hiddenAddressEnt = $(hiddenBillingAddress).val();
                        $(billingAddress).val(hiddenAddressEnt);
                        var billingCity = ".wrapCity #billingCity";
                        var hiddenCity = 'input[id$="CityUS"]';
                        var hiddenCityEnt = $(hiddenCity).val();
                        $(billingCity).val(hiddenCityEnt);
                        var billingZip = ".wrapZip #zip";
                        var hiddenZip = 'input[id$="ZipUS"]';
                        var hiddenZipEnt = $(hiddenZip).val();
                        $(billingZip).val(hiddenZipEnt);
                        var billingPhone = ".personalInfoList #billingPhone";
                        var hiddenBillingPhone =
                            '.billingInfo [id*="txtPhone"]';
                        var hiddenPhoneEnt = $(hiddenBillingPhone).val();
                        $(billingPhone).val(hiddenPhoneEnt);
                        var billingEmail = ".personalInfoList #email";
                        var hiddenBillingEmail =
                            '.billingInfo [id*="txtEmailAddress"]';
                        var hiddenEmailEnt = $(hiddenBillingEmail).val();
                        $(billingEmail).val(hiddenEmailEnt);
                    }
                },
                autoFillExtraction: function() {
                    // CHECK IF DESIGNATION PRESENT
                    var designationCheck = $(
                        "span[id$=DesignationValue]"
                    ).text();
                    $("#fundDesignList").append(
                        $("<option>", {
                            value: designationCheck,
                        }).text(designationCheck)
                    );
                    // PART 7: EXTRACT ALL VALUES
                    $("input#cscCode").blur(function() {
                        var billingFirstName =
                            ".donorFirstName #billingFirstName";
                        var hiddenFirstName =
                            '.billingInfo [id*="txtFirstName"]';
                        var billingFirstNameEnt = $(billingFirstName).val();
                        $(hiddenFirstName).val(billingFirstNameEnt);
                        var billingLastName = ".donorLastName #billingLastName";
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var billingLastNameEnt = $(billingLastName).val();
                        $(hiddenLastName).val(billingLastNameEnt);
                        var billingAddress =
                            ".personalInfoList #billingAddress";
                        var hiddenBillingAddress =
                            '.billingInfo [id*="AddressLine"]';
                        var billingAddressEnt = $(billingAddress).val();
                        $(hiddenBillingAddress).val(billingAddressEnt);
                        var billingCity = ".wrapCity #billingCity";
                        var hiddenCity = '.billingInfo [id*="City"]';
                        var billingCityEnt = $(billingCity).val();
                        $(hiddenCity).val(billingCityEnt);
                        var billingZip = ".wrapZip #zip";
                        var hiddenZip = '.DonationFormTable [id*="Zip"]';
                        var billingZipEnt = $(billingZip).val();
                        $(hiddenZip).val(billingZipEnt);
                        var billingPhone = ".personalInfoList #billingPhone";
                        var hiddenBillingPhone =
                            '.billingInfo [id*="txtPhone"]';
                        var billingPhoneEnt = $(billingPhone).val();
                        $(hiddenBillingPhone).val(billingPhoneEnt);
                        var billingEmail = ".personalInfoList #email";
                        var hiddenBillingEmail =
                            '.billingInfo [id*="txtEmailAddress"]';
                        var billingEmailEnt = $(billingEmail).val();
                        $(hiddenBillingEmail).val(billingEmailEnt);
                    });
                },
                submitButton: function() {
                    $(
                        '.DonationButtonCell input[type="submit"].DonationSubmitButton'
                    ).prependTo(".submitButton");
                },
            }, // END STEP 3 PAYMENT INFO
            /* Animate Step Here */
            stepOneToggleAnimations: function() {
                $(".donateAmount h3").addClass("complete");
                $(".donorInfo .personalInfoList")
                    .removeClass("hide")
                    .slideDown();
                $(".donorInfo")
                    .find("h3")
                    .removeClass();
                $("#billingFirstName").focus();
            },
            stepToggles: function() {
                $(
                    '#wrapSingleGivingForm .givingAmountOptions .rdoAmount input[type="radio"]'
                ).click(function() {
                    if (
                        $(this).is(":checked") &&
                        $("ul.giftType").length === 0
                    ) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $(
                    '#wrapSingleGivingForm .givingAmountOptions .otherAmount input[type="text"]'
                ).blur(function() {
                    if ($(this).val() !== "" && $("ul.giftType").length === 0) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $(
                    '#wrapSingleGivingForm .giftType li input[type="checkbox"]'
                ).click(function() {
                    if ($(this).is(":checked")) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                /* STEP 3 HIDDEN Here */
                $('input#email[type="email"]').keyup(function() {
                    var emailValidator = new RegExp(
                        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                    );
                    if (
                        $(this)
                        .val()
                        .match(emailValidator)
                    ) {
                        $(".paymentInfo")
                            .removeClass("hide")
                            .slideDown();
                        $(".donorInfo")
                            .find("h3")
                            .addClass("complete");
                        $(".paymentInfo")
                            .find("h3")
                            .removeClass();
                        //$('#cardholder').focus();
                    }
                });
                if ($("body").hasClass("Explorer")) {
                    $(".personalInfoList input#email").keyup(function() {
                        var emailValidator = new RegExp(
                            /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                        );
                        if (
                            $(this)
                            .val()
                            .match(emailValidator)
                        ) {
                            $(".paymentInfo")
                                .removeClass("hide")
                                .slideDown();
                            $(".donorInfo")
                                .find("h3")
                                .addClass("complete");
                            $(".paymentInfo")
                                .find("h3")
                                .removeClass();
                            //$('#cardholder').focus();
                        }
                    });
                }
            },
            hiddenFormValidation: function() {
                // Form Error(s) Text
                $(
                    '#wrapSingleGivingForm + [id*="UpdatePanel"] .DonationFormTable [id*="ValidationSummary1"].DonationValidationSummary'
                ).insertBefore(".donateAmount");
                // Form Submitted Text
                var forSubmittedText = $(
                    '[id*="lblThanks"].DonationMessage'
                ).insertBefore(".donateAmount");
                if ($(forSubmittedText).length) {
                    $("fieldset.step").hide();
                }
            },
        }, // END CUSTOM SINGLE DONATION
        resetBackgrounds: function() {
            $(".wrapBreadcrumbs p img").show();
            $(
                "#internalPage .inner-wrap .siteWrapper .fullWidthBackgroundImage"
            ).removeAttr("style");
        },
    },
};
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
});
// document.write('<scr'+'ipt src="/file/web-dev/jquery.bxslider.min.js"></scr'+'ipt>');
// Case insensitive version of ':contains()'
jQuery.expr[":"].Contains = function(a, i, m) {
    return (
        jQuery(a)
        .text()
        .toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0
    );
};
// Make it safe to use console.log always
window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        arguments.callee = arguments.callee.caller;
        var a = [].slice.call(arguments);
        typeof console.log === "object" ?
            log.apply.call(console.log, console, a) :
            console.log.apply(console, a);
    }
};
(function(b) {
    function c() {}
    for (
        var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(
                ","
            ),
            a;
        (a = d.pop());

    ) {
        b[a] = b[a] || c;
    }
})(
    (function() {
        try {
            console.log();
            return window.console;
        } catch (err) {
            return (window.console = {});
        }
    })()
);

$("#fundSelect").on('change', function(e) {
    BBI.Methods.addFund($(this));
});

$("#help-link").on("click", function(e) {
    $("#help-content").slideToggle();
    $(this).find(".fa").toggleClass("rotate");
});