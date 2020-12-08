
$(document).ready(function () {
    console.log(window.location.href);
    if ($('.main-left').length) {
        $('body').append(appendAddon());
    }
    //httpGet('http://batdongsan.vn/can-duy-nhat-120-ty-mat-pho-phan-chu-trinh-hoan-kiem-dang-cho-thue-6-ty/nam-p475974.html');
});

$(document).on('click', '#bt_get_data', function () {
    var $that = $(this);
    if ($that.hasClass('button--loading'))
        return;
    var currentHref = window.location.href;
    if (/-pr[0-9]/.test(currentHref)) {

        var myRegexp = /-pr([0-9]+)/g;
        var match = myRegexp.exec(currentHref);
        $that.toggleClass('button--loading');
        var info = [];
        //Lay ngay dang
        var publishDate = '';
        $('#product-detail-web .product-config ul li').each(function () {
            let text = $(this).find('.sp1').text().replace(/(\r\n|\n|\r)/gm, "").trim().toLowerCase();
            if (text.includes('ngày đăng')) {
                publishDate = $(this).find('.sp3').text().replace(/(\r\n|\n|\r)/gm, "").trim().toLowerCase()
            }
        });

        info.push(publishDate);
        //Tieu de
        info.push($('#product-detail-web h1.tile-product').text().replace(/(\r\n|\n|\r)/gm, "").trim());
        //Lay href
        info.push(currentHref);
        var content = $('#product-detail-web .des-product').text().replace(/(\r\n|\n|\r)/gm, "").trim();
        //lay content
        info.push(content);
        //console.log(content);
        if ($('#product-detail-web .short-detail-wrap ul.short-detail-2').length) {
            try {
                var price = '';
                var square = '';
                var basePrice = '';
                $('#product-detail-web .short-detail-wrap ul.short-detail-2 li').each(function () {
                    let type = $(this).find('.sp1').text().includes('ngày đăng');
                    if ($(this).find('.sp1').text().includes('giá')) {
                        price = $(this).find('.sp2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                    }
                    else if ($(this).find('.sp1').text().includes('tích')) {
                        square = $(this).find('.sp2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                    }
                });
                //Xu ly m2
                var squareNumber = square.replace(/[^\d.,]/g, '');
                if (price && !price.includes('/m') && !price.includes('thuận') && squareNumber) {
                    basePrice = price;
                    if (price.includes('triệu')) {
                        let unit = 1000000;
                        var priceNumber = (price.replace(/[^\d.,]/g, '')) * unit;
                        var pricePerM2 = priceNumber / parseFloat(squareNumber);
                        if (pricePerM2 > unit) {
                            price = (pricePerM2 / unit).toFixed(2) + " triệu/m²";
                        }
                        else
                            price = (pricePerM2 * 1000 / unit).toFixed(2) + " ngàn/m²";

                    }
                    else if (price.includes('tỷ')) {
                        let unit = 1000000000;
                        var priceNumber = (price.replace(/[^\d.,]/g, '')) * unit;
                        var pricePerM2 = priceNumber / parseFloat(squareNumber);
                        if (pricePerM2 > unit) {
                            price = (pricePerM2 / unit).toFixed(2) + " tỷ/m²";
                        }
                        else
                            price = (pricePerM2 * 1000 / unit).toFixed(2) + " triệu/m²";
                    }
                }
                info.push(price);
                info.push(square);
                info.push(basePrice);
            } catch (error) {

            }
        }

        //Duong vao
        var streetWide = '';
        //mat tien
        var landWide = '';
        //huong nhe
        var direction = '';
        if ($('#product-detail-web .detail-product .detail-2 .box-round-grey3').length) {
            //Ex: Loại tin rao: Bán đất
            //Địa chỉ: Đường Đông Ngàn, Xã Đông Hội, Đông Anh, Hà Nội
            var detail = '';
            $('#product-detail-web .detail-product .detail-2 .box-round-grey3 .row-1').each(function () {
                var tag = $(this).find('.r1').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                var data = $(this).find('.r2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                var tagLowerCase = tag.toLowerCase();
                if (tagLowerCase.includes('hướng nhà'))
                    direction = data;
                else if (tagLowerCase.includes('đường'))
                    streetWide = data;
                else if (tagLowerCase.includes('mặt tiền'))
                    landWide = data;

                detail += (tag + ': ' + data + '\n');
            });
            info.push(detail);
            info.push(streetWide);
            info.push(landWide);
            info.push(direction);
        }

        if ($('#product-detail-web .des-product .hidden-phone').length) {
            var contactName = $('.main-right .box-contact .user').find('div.name').text().replace(/(\r\n|\n|\r)/gm, "").trim();
            var phone = '';
            if ($('#product-detail-web .des-product').find('.hidden-phone').length === 1) {
                phone = $('#product-detail-web .des-product').find('.hidden-phone').attr('raw').replace(/(\r\n|\n|\r)/gm, "").trim();
            }
            else {
                $('#product-detail-web .des-product').find('.hidden-phone').each(function () {
                    phone += $(this).attr('raw').replace(/(\r\n|\n|\r)/gm, "").trim() + ';';
                });
            }

            if (!phone) {
                phone = $('.main-right .box-contact .user').find('.phoneEvent').attr('raw').replace(/(\r\n|\n|\r)/gm, "").trim();
            }
            else {
                var userPhone = $('.main-right .box-contact .user').find('.phoneEvent').attr('raw').replace(/(\r\n|\n|\r)/gm, "").trim();
                if (!phone.includes(userPhone))
                    phone += ';' + userPhone;
            }
            var email = $('.main-right .box-contact .user').find('div.mail a').attr('data-email').replace(/(\r\n|\n|\r)/gm, "").trim();
            info.push(contactName);
            info.push(phone);
            info.push(email);
        }

        var selectedSheet = $('#selected_sheet').val();
        setTimeout(function () {
            $.ajax({
                type: "POST",
                data: {
                    info: info,
                    sheet: selectedSheet
                },
                async: false,
                url: "http://localhost:8080/gsheet/process.php",
                success: function (msg) {
                    console.log(msg);
                    $that.toggleClass('button--loading');
                    setCookie('selected_sheet', selectedSheet, 30);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert("Lỗi server, không thể lấy dữ liệu");
                    $that.toggleClass('button--loading');
                }
            });
        }, 3000);

    } else {
        $that.addClass('button--loading');
        var selectedSheet = $('#selected_sheet').val();
        setTimeout(function () {
            $('.main-left #product-lists-web .product-item').each(function (index, elm) {
                console.log(index);
                var href = $(this).find('a.wrap-plink').attr('href');
                httpGet(window.location.origin + href, selectedSheet);
            });
            setCookie('selected_sheet', selectedSheet, 30);
            $that.removeClass('button--loading');
        }, 3000);
        //var fullurlTest = '';


        //httpGet(fullurlTest);
    }
});

function appendAddon() {
    var selectedSheet = getCookie('selected_sheet');
    var html = '<div">';
    html += '<a id="bt_get_data" href="javascript:void(0)" class="button-ext" style="position: fixed;bottom: 10px;text-align: center;height: 59px;padding-top: 20px;"><span>Lấy dữ liệu</span></a>';
    html += '<input class="field-input" id="selected_sheet" name="inputName" type="text" placeholder="Sheet name" value="' + selectedSheet + '">';
    html += '</div>';

    return html;
}

function httpGet(theUrl, sheet) {
    $.ajax({
        type: "GET",
        url: theUrl,
        async: false,
        success: function (responseText) {
            var info = [];
            $jQueryObject = $('<div/>').html(responseText).contents();
            var publishDate = '';
            $jQueryObject.find('#product-detail-web .product-config ul li').each(function () {
                let text = $(this).find('.sp1').text().replace(/(\r\n|\n|\r)/gm, "").trim().toLowerCase();
                if (text.includes('ngày đăng')) {
                    publishDate = $(this).find('.sp3').text().replace(/(\r\n|\n|\r)/gm, "").trim().toLowerCase()
                }
            });
            //ngay dang
            info.push(publishDate);
            //Tieu de
            info.push($jQueryObject.find('#product-detail-web h1.tile-product').text().replace(/(\r\n|\n|\r)/gm, "").trim());
            //Link bai viet
            info.push(theUrl);

            var content = $jQueryObject.find('#product-detail-web .des-product').text().replace(/(\r\n|\n|\r)/gm, "").trim();
            info.push(content);

            if ($jQueryObject.find('#product-detail-web .short-detail-wrap ul.short-detail-2').length) {
                try {
                    var price = '';
                    var square = '';
                    var basePrice = '';
                    $jQueryObject.find('#product-detail-web .short-detail-wrap ul.short-detail-2 li').each(function () {
                        if ($(this).find('.sp1').text().includes('giá')) {
                            price = $(this).find('.sp2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                        }
                        else if ($(this).find('.sp1').text().includes('tích')) {
                            square = $(this).find('.sp2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                        }
                    });
                    //Xu ly m2
                    var squareNumber = square.replace(/[^\d.,]/g, '');
                    if (price && !price.includes('/m') && !price.includes('thuận') && squareNumber) {
                        basePrice = price;
                        if (price.includes('triệu')) {
                            let unit = 1000000;
                            var priceNumber = (price.replace(/[^\d.,]/g, '')) * unit;
                            var pricePerM2 = priceNumber / parseFloat(squareNumber);
                            if (pricePerM2 > unit) {
                                price = (pricePerM2 / unit).toFixed(2) + " triệu/m²";
                            }
                            else
                                price = (pricePerM2 * 1000 / unit).toFixed(2) + " ngàn/m²";

                        }
                        else if (price.includes('tỷ')) {
                            let unit = 1000000000;
                            var priceNumber = (price.replace(/[^\d.,]/g, '')) * unit;
                            var pricePerM2 = priceNumber / parseFloat(squareNumber);
                            if (pricePerM2 > unit) {
                                price = (pricePerM2 / unit).toFixed(2) + " tỷ/m²";
                            }
                            else
                                price = (pricePerM2 * 1000 / unit).toFixed(2) + " triệu/m²";
                        }
                    }
                    info.push(price);
                    info.push(square);
                    info.push(basePrice);
                } catch (error) {

                }
            }

            //Duong vao
            var streetWide = '';
            //mat tien
            var landWide = '';
            //huong nhe
            var direction = '';

            if ($jQueryObject.find('#product-detail-web .detail-product .detail-2 .box-round-grey3').length) {
                //Ex: Loại tin rao: Bán đất
                //Địa chỉ: Đường Đông Ngàn, Xã Đông Hội, Đông Anh, Hà Nội
                var detail = '';
                $jQueryObject.find('#product-detail-web .detail-product .detail-2 .box-round-grey3 .row-1').each(function () {
                    var tag = $(this).find('.r1').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                    var data = $(this).find('.r2').text().replace(/(\r\n|\n|\r)/gm, "").trim();
                    var tagLowerCase = tag.toLowerCase();
                    if (tagLowerCase.includes('hướng nhà'))
                        direction = data;
                    else if (tagLowerCase.includes('đường'))
                        streetWide = data;
                    else if (tagLowerCase.includes('mặt tiền'))
                        landWide = data;

                    detail += (tag + ': ' + data + '\n');
                });
                info.push(detail);
                info.push(streetWide);
                info.push(landWide);
                info.push(direction);
            }

            var phone = '';
            if ($jQueryObject.find('.main-right .box-contact .user').find('.phoneEvent').attr('raw')) {
                phone = $jQueryObject.find('.main-right .box-contact .user').find('.phoneEvent').attr('raw').replace(/(\r\n|\n|\r)/gm, "").trim();
            }
            var email = '';

            if ($jQueryObject.find('.main-right .box-contact .user').find('div.mail a').attr('data-email')) {
                email = $jQueryObject.find('.main-right .box-contact .user').find('div.mail a').attr('data-email').replace(/(\r\n|\n|\r)/gm, "").trim();
            }


            var contactName = $jQueryObject.find('.main-right .box-contact .user').find('div.name').text().replace(/(\r\n|\n|\r)/gm, "").trim();

            info.push(contactName);
            info.push(phone);
            info.push(email);

            $.ajax({
                type: "POST",
                data: {
                    info: info,
                    sheet: sheet
                },
                async: false,
                url: "http://localhost:8080/gsheet/process.php",
                success: function (msg) {
                    console.log(msg);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("Lỗi server, không thể lấy dữ liệu");

                }
            });
        },
        error: function (xhr, ajaxOptions, thrownError) { console.log("error:" + theUrl); }
    });
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
}
function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}