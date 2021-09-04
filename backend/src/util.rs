use rand::{distributions::Alphanumeric, Rng};

pub fn get_default_offset(offset_opt: &Option<i64>) -> &i64 {
    match offset_opt {
        Some(ref offset) => offset,
        None => &0,
    }
}

pub fn get_rand_str(len: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}
