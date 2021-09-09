pub mod article;
pub mod user;

use tokio_postgres::types;
use types::ToSql;

#[inline]
fn get_article_query(from_clause: &str, where_clause: &str, order_by_clause: &str) -> String {
    format!(
        r#"
            SELECT 
                id, title, author, created_on, uploader_id, content_description,
                
                is_system, is_private,
                
                lang, tags,

                unique_word_count

                FROM {} 
            WHERE 
                COALESCE(lang = $1, TRUE) AND
                COALESCE(title &@~ $2, TRUE)
                {}
            ORDER BY {} DESC 
            LIMIT $4 
            OFFSET $3
        "#,
        from_clause, where_clause, order_by_clause
    )
}

fn extract_opt_inc_param<'a, T, U>(
    params: &mut [&'a (dyn ToSql + Sync)],
    current_param: &mut usize,
    opt: &'a Option<T>,
    name: &str,
    func: &mut U,
) -> bool
where
    T: ToSql + Sync,
    U: FnMut(&str, &usize),
{
    if let Some(val) = opt {
        params[*current_param] = val;
        (*func)(name, current_param);
        *current_param += 1;
        return true;
    }

    false
}
