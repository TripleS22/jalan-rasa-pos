<?php

namespace App\Support;

/**
 * Kode akun COA baku dipakai posting jurnal otomatis. Lihat DatabaseSeeder untuk daftar lengkap.
 */
final class AccountCode
{
    public const KAS = '1101';

    public const BANK = '1102';

    public const PIUTANG_USAHA = '1103';

    public const PERSEDIAAN_BAHAN_BAKU = '1104';

    public const PERSEDIAAN_PRODUK_JADI = '1105';

    public const BIAYA_DIBAYAR_DIMUKA = '1106';

    public const ASET_TETAP = '1201';

    public const AKUMULASI_PENYUSUTAN = '1202';

    public const UTANG_USAHA = '2101';

    public const UANG_MUKA_PELANGGAN = '2102';

    public const MODAL_PEMILIK = '3101';

    public const PENDAPATAN_PENJUALAN = '4101';

    public const HPP = '5101';

    public const BEBAN_OPERASIONAL = '5102';

    public const BEBAN_KERUGIAN = '5103';

    public const BEBAN_PENYUSUTAN = '5104';
}
