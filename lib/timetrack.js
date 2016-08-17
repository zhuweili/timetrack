/**
 * Created by user on 8/16/16.
 */
var qs = require('querystring');

exports.sendHtml = function(res, html) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(html);
}

exports.praseReceivedData = function (req, cb) {
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ body += chunk });
    req.on('end', function() {
        var data = qs.parse(body);
        cb(data); //执行sql 见下程序:
    });
};

exports.actionForm = function(id, path, label) {
    var html = '<form method="POST" action="' + path + '">' +
        '<input type="hidden" name="id" value="' + id + '">' +
        '<input type="submit" value="' + label + '" />' +
        '</form>';
    return html;
};  //渲染表单

exports.add = function(db, req, res) {
    exports.praseReceivedData(req, function(work) {
        db.query(
            "INSERT INTO work (hours, date, description) " +
            " VALUES (?, ?, ?)",
            [work.hours, work.date, work.description],
            function(err) {
                if (err) throw err;
                exports.show(db, res);
            }
        );
    });
};  // []把sql的三个参数直接转义, 防止注入攻击

exports.delete = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {
        db.query(
            "DELETE FROM work WHERE id=?",
            [work.id],
            function(err) {
                if (err) throw err;
                exports.show(db, res);
            }
        );
    });
};//删除记录

exports.archive = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {
        db.query(
            "UPDATE work SET archived=1 WHERE id=?",
            [work.id],
            function(err) {
                if (err) throw err;
                exports.show(db, res);
            }
        );
    });
}; // 更新记录


exports.show = function(db, res, showArchived) {
    var query = "SELECT * FROM work " +
        "WHERE archived=? " +
        "ORDER BY date DESC";
    var archiveValue = (showArchived) ? 1 : 0;
    db.query(
        query,
        [archiveValue],
        function(err, rows) {
            if (err) throw err;
            html = (showArchived)
                ? ''
                : '<a href="/archived">Archived Work</a><br/>';
            html += exports.workHitlistHtml(rows);
            html += exports.workFormHtml();
            exports.sendHtml(res, html);
        }
    );
};//渲染网页


exports.showArchived = function(db, res) {
    exports.show(db, res, true);
};

exports.workHitlistHtml = function(rows) {
    var html = '<table>';
    for(var i in rows) {
        html += '<tr>';
        html += '<td>' + rows[i].date + '</td>';
        html += '<td>' + rows[i].hours + '</td>';
        html += '<td>' + rows[i].description + '</td>';
        if (!rows[i].archived) {
            html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
        }
        html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
        html += '</tr>';
    }
    html += '</table>';
    return html;
};

exports.workFormHtml = function() {
    var html = '<form method="POST" action="/">' +
        '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
        '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
        '<p>Description:<br/>' +
        '<textarea name="description"></textarea></p>' +
        '<input type="submit" value="Add" />' +
        '</form>';
    return html;
};

exports.workAr
