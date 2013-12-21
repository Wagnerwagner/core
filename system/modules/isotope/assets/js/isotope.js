/**
 * Isotope eCommerce for Contao Open Source CMS
 *
 * Copyright (C) 2009-2012 Isotope eCommerce Workgroup
 *
 * @package    Isotope
 * @link       http://www.isotopeecommerce.com
 * @license    http://opensource.org/licenses/lgpl-3.0.html LGPL
 */


var Isotope = {};

(function() {
    "use strict";

    /**
     * Toggle the address fields
     * @param object
     * @param string
     */
    Isotope.toggleAddressFields = function(el, id) {
        if (el.value == '0' && el.checked) {
            document.getElementById(id).style.display = 'block';
        } else {
            document.getElementById(id).style.display = 'none';
        }
    };

    /**
     * Display a "loading data" message
     * @param string
     * @param boolean
     */
    Isotope.displayBox = function(message, btnClose) {
        var box = document.getElementById('iso_ajaxBox');
        var overlay = document.getElementById('iso_ajaxOverlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.setAttribute('id', 'iso_ajaxOverlay');
            document.body.appendChild(overlay);
        }

        if (!box) {
            box = document.createElement('div');
            box.setAttribute('id', 'iso_ajaxBox');
            document.body.appendChild(box);
        }

        if (btnClose) {
            overlay.addEventListener('click', Isotope.hideBox, false);
            box.addEventListener('click', Isotope.hideBox, false);
            if (!box.className.search(/btnClose/) != -1) {
                box.className = box.className + ' btnClose';
            }
        }

        var scroll = window.getScroll().y;

        overlay.style.display = 'block';

        box.innerHTML = message;
        box.style.display = 'block';
        box.style.top = ((scroll + 100) + 'px');
    };

    /**
     * Hide the "loading data" message
     */
    Isotope.hideBox = function() {
        var box = document.getElementById('iso_ajaxBox');
        var overlay = document.getElementById('iso_ajaxOverlay');

        if (overlay) {
            overlay.style.display = 'none';
            overlay.removeEventListener('click', Isotope.hideBox, false);
        }

        if (box) {
            box.style.display = 'none';
            box.removeEventListener('click', Isotope.hideBox, false);
            box.className = box.className.replace(/ ?btnClose/, '');
        }
    };

    /**
     * Initialize the inline gallery
     * @param object
     * @param string
     */
    Isotope.inlineGallery = function(el, elementId) {
        var i;
        var parent = el.parentNode;
        var siblings = parent.parentNode.children;

        for (i=0; i<siblings.length; i++) {
            if (siblings[i].getAttribute('data-type') == 'gallery'
                && siblings[i].getAttribute('data-uid') == elementId
                && siblings[i].getAttribute('class').search(/(^| )active($| )/) != -1
            ) {
                siblings[i].setAttribute('class', siblings[i].getAttribute('class').replace(/ ?active/, ''));
            }
        }

        parent.setAttribute('class', parent.getAttribute('class') + ' active');
        document.getElementById(elementId).src = el.href;

        return false;
    };
})();

var IsotopeProducts = (function() {
    "use strict";

    var loadMessage = 'Loading product data …';

    function initProduct(config) {
        var form = document.getElementById(config.formId);

        if (form) {
            registerEvents(form, config);
        }
    }

    function registerEvents(form, config) {
        var i, el, xhr;

console.log(form, getFormAsQueryString(form));

        form.addEventListener('submit', function() {

        }, false);


        document.id(form).set('send', {
            url: window.location.href,
            link: 'cancel',
            onRequest: Isotope.displayBox.pass(loadMessage),
            onSuccess: function(txt, xml)
            {
                Isotope.hideBox();

                var div = document.createElement('div');
                div.innerHTML = txt;
                var newForm = div.firstChild;

                // Remove all error messages
                var errors = div.getElementsByTagName('p');
                for(var i=0; i<errors.length; i++) {
                    if (errors[i].className.search(/(^| )error( |$)/) != -1) {
                        error[i].parentNode.removeChild(error[i]);
                    }
                }

                form.parentNode.replaceChild(newForm, form);
                registerEvents(newForm, config);
            },
            onFailure: Isotope.hideBox
        });

        if (config.attributes) {
            for (i=0; i<config.attributes.length; i++) {
                el = document.getElementById(('ctrl_'+config.attributes[i]+'_'+config.formId));
                if (el) {
                    el.addEventListener('change', function() {
                        form.send();
                    }, false);
                }
            }
        }
    }

    function getFormAsQueryString(form) {
        var el, type, value, options, i, o;
        var queryString = [];
        var elements = form.querySelectorAll('input, select, textarea');

        for(i=0; i<elements.length; i++) {
            el = elements[i];
            type = el.type;

            if (!el.name || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') {
                continue;
            }

            if (el.tagName == 'select') {
                options = el.getElementsByTagName('option');
                for (o=0; o<options.length; o++) {
                    if (options[o].selected && typeof options[o].value != 'undefined') {
                        queryString.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(options[o].value))
                    }
                }
            } else if (((type != 'radio' && type != 'checkbox') || el.checked) && typeof el.value != 'undefined') {
                queryString.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value))
            }
        }

        return queryString.join('&');
    }

    return {
        'attach': function(products) {
            var i;

            // Check if products is an array
            if (Object.prototype.toString.call(products) === '[object Array]' && products.length > 0) {
                for (i=0; i<products.length; i++) {
                    initProduct(products[i]);
                }
            }
        },

        /**
         * Overwrite the default message
         */
        'setLoadMessage': function(message) {
            loadMessage = message || 'Loading product data …';
        }
    };
})();
